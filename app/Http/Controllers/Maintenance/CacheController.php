<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CacheController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function index()
    {
        return Inertia::render('Maintenance/Cache', [
            'clear_actions'   => config('maintenance.cache_clear', []),
            'rebuild_actions' => config('maintenance.cache_rebuild', []),
            'reauth_valid'    => $this->service->reauthValid(),
            'recent_logs'     => $this->service->recentLogs(5),
        ]);
    }

    /**
     * GET /admin/maintenance/cache/clear?cache={key} — confirmation only.
     */
    public function confirmClear(Request $request)
    {
        return $this->confirm($request, 'clear', 'maintenance.cache.clear');
    }

    /**
     * GET /admin/maintenance/cache/rebuild?cache={key} — confirmation only.
     */
    public function confirmRebuild(Request $request)
    {
        return $this->confirm($request, 'rebuild', 'maintenance.cache.rebuild');
    }

    private function confirm(Request $request, string $mode, string $endpointName)
    {
        $key = $request->query('cache');

        if (! $key) {
            return redirect()->route('maintenance.cache.index')
                ->with('error', 'No cache action was selected.');
        }

        $actions = config("maintenance.cache_{$mode}", []);

        if (! isset($actions[$key])) {
            return redirect()->route('maintenance.cache.index')
                ->with('error', "Unknown cache {$mode} action.");
        }

        $action = $actions[$key];

        $impact = $mode === 'clear'
            ? 'Clearing removes cached configuration, routes or views. Application performance may dip momentarily until rebuilt. No data is lost.'
            : 'Rebuilding writes new cache files to the server. Route caching fails cleanly if any route uses a closure.';

        return Inertia::render('Maintenance/ConfirmOperation', [
            'operation' => [
                'kind'     => "cache.{$mode}",
                'label'    => "{$action['label']} — {$mode}",
                'command'  => "php artisan {$action['command']}",
                'danger'   => false,
                'impact'   => $impact,
                'payload'  => ['key' => $key],
                'endpoint' => route($endpointName),
                'back'     => route('maintenance.cache.index'),
            ],
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * POST /admin/maintenance/cache/clear  (key from allowlist)
     */
    public function clear(Request $request)
    {
        $validated = $request->validate(['key' => ['required', 'string', 'max:32']]);

        if ($error = $this->service->reauthError()) {
            return back()->with('error', $error);
        }

        $actions = config('maintenance.cache_clear', []);

        if (! isset($actions[$validated['key']])) {
            return back()->with('error', 'Unknown cache action.');
        }

        $action = $actions[$validated['key']];

        $result = $this->service->withLock('cache.clear', $validated['key'], fn () => $this->service->runCommand($action['command']));

        return back()->with($result['success'] ? 'success' : 'error',
            ($action['label'] ?? $validated['key']).': '.$result['output']);
    }

    /**
     * POST /admin/maintenance/cache/rebuild  (key from allowlist)
     */
    public function rebuild(Request $request)
    {
        $validated = $request->validate(['key' => ['required', 'string', 'max:32']]);

        if ($error = $this->service->reauthError()) {
            return back()->with('error', $error);
        }

        $actions = config('maintenance.cache_rebuild', []);

        if (! isset($actions[$validated['key']])) {
            return back()->with('error', 'Unknown cache rebuild action.');
        }

        $action = $actions[$validated['key']];

        $result = $this->service->withLock('cache.rebuild', $validated['key'], fn () => $this->service->runCommand($action['command']));

        return back()->with($result['success'] ? 'success' : 'error',
            ($action['label'] ?? $validated['key']).': '.$result['output']);
    }
}
