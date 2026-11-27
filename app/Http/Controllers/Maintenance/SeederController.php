<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeederController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function index()
    {
        return Inertia::render('Maintenance/Seeders', [
            'seeders'      => $this->service->seederRegistry(),
            'groups'       => $this->service->seederGroups(),
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * GET /admin/maintenance/seeders/run?seeder={slug} — confirmation only.
     * Group confirmation uses ?group={slug}.
     */
    public function confirm(Request $request)
    {
        $seederSlug = $request->query('seeder');
        $groupSlug  = $request->query('group');

        if ($groupSlug) {
            $groups = collect(config('maintenance.seeder_groups', []));

            if (! $groups->has($groupSlug)) {
                return back()->with('error', 'Unknown or unapproved seeder group.');
            }

            $group = $groups->get($groupSlug);

            return Inertia::render('Maintenance/ConfirmOperation', [
                'operation' => [
                    'kind'     => 'seeders.group',
                    'label'    => "Run seeder group: {$groupSlug}",
                    'command'  => 'db:seed — member seeders: '.implode(', ', $group['seeders'] ?? []),
                    'danger'   => true,
                    'impact'   => 'Runs each member seeder against the PRODUCTION database. Seeders can create or update records. Back up the database before continuing.',
                    'payload'  => ['group' => $groupSlug],
                    'endpoint' => route('maintenance.seeders.run'),
                    'back'     => route('maintenance.seeders.index'),
                ],
                'reauth_valid' => $this->service->reauthValid(),
            ]);
        }

        if (! $seederSlug) {
            return redirect()->route('maintenance.seeders.index')
                ->with('error', 'No seeder was selected.');
        }

        $registry = collect(config('maintenance.seeders', []));

        if (! $registry->has($seederSlug)) {
            return redirect()->route('maintenance.seeders.index')
                ->with('error', 'Unknown or unapproved seeder.');
        }

        $entry = $registry->get($seederSlug);

        if (! class_exists($entry['class']) || ! is_subclass_of($entry['class'], \Illuminate\Database\Seeder::class)) {
            return redirect()->route('maintenance.seeders.index')
                ->with('error', 'The registered seeder class is invalid on this deployment.');
        }

        return Inertia::render('Maintenance/ConfirmOperation', [
            'operation' => [
                'kind'     => 'seeders.run',
                'label'    => "Run seeder: {$seederSlug}",
                'command'  => "php artisan db:seed --class={$entry['class']} --force",
                'danger'   => true,
                'impact'   => ($entry['description'] ?? '').' Seeders can modify production data — back up first.',
                'payload'  => ['slug' => $seederSlug],
                'endpoint' => route('maintenance.seeders.run'),
                'back'     => route('maintenance.seeders.index'),
            ],
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * POST /admin/maintenance/seeders/run
     * Body: slug (allowlist key) OR group (group key). Never a class name.
     */
    public function run(Request $request)
    {
        $validated = $request->validate([
            'slug'  => ['nullable', 'string', 'max:64'],
            'group' => ['nullable', 'string', 'max:64'],
        ]);

        if ($error = $this->service->reauthError()) {
            return back()->with('error', $error);
        }

        // Group execution: run each member seeder in allowlisted order.
        if (! empty($validated['group'])) {
            $groups = collect(config('maintenance.seeder_groups', []));

            if (! $groups->has($validated['group'])) {
                return back()->with('error', 'Unknown or unapproved seeder group.');
            }

            $group = $groups->get($validated['group']);

            $result = $this->service->withLock('seeders.group', $validated['group'], function () use ($group) {
                $allOutput = [];
                $allSuccess = true;

                foreach ($group['seeders'] ?? [] as $slug) {
                    $res = $this->service->runSeeder($slug);
                    $allSuccess = $allSuccess && $res['success'];
                    $allOutput[] = ($slug.': ').($res['output'] ?? '');
                }

                return [
                    'success' => $allSuccess,
                    'output'  => implode(' | ', $allOutput),
                ];
            });

            return back()->with($result['success'] ? 'success' : 'error', $result['output']);
        }

        if (empty($validated['slug'])) {
            return back()->with('error', 'No seeder was selected.');
        }

        $slug = $validated['slug'];

        $result = $this->service->withLock('seeders.run', $slug, fn () => $this->service->runSeeder($slug));

        return back()->with($result['success'] ? 'success' : 'error', $result['output']);
    }
}
