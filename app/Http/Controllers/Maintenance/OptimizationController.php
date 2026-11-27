<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OptimizationController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function index()
    {
        return Inertia::render('Maintenance/Optimization', [
            'actions'      => config('maintenance.optimization', []),
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * GET /admin/maintenance/optimization/run?command={key} — confirmation only.
     */
    public function confirm(Request $request)
    {
        $key = $request->query('command');

        if (! $key) {
            return redirect()->route('maintenance.optimization.index')
                ->with('error', 'No optimization action was selected.');
        }

        $actions = config('maintenance.optimization', []);

        if (! isset($actions[$key])) {
            return redirect()->route('maintenance.optimization.index')
                ->with('error', 'Unknown optimization action.');
        }

        $action = $actions[$key];

        return Inertia::render('Maintenance/ConfirmOperation', [
            'operation' => [
                'kind'     => 'optimization.run',
                'label'    => $action['label'],
                'command'  => "php artisan {$action['command']}",
                'danger'   => false,
                'impact'   => 'Writes cache files to the server. If the hosting environment does not support this command, the operation will fail cleanly rather than report fake success.',
                'payload'  => ['key' => $key],
                'endpoint' => route('maintenance.optimization.run'),
                'back'     => route('maintenance.optimization.index'),
            ],
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    public function run(Request $request)
    {
        $validated = $request->validate(['key' => ['required', 'string', 'max:32']]);

        if ($error = $this->service->reauthError()) {
            return back()->with('error', $error);
        }

        $actions = config('maintenance.optimization', []);

        if (! isset($actions[$validated['key']])) {
            return back()->with('error', 'Unknown optimization action.');
        }

        $action = $actions[$validated['key']];

        $result = $this->service->withLock('optimization.run', $validated['key'], fn () => $this->service->runCommand($action['command']));

        return back()->with($result['success'] ? 'success' : 'error',
            ($action['label'] ?? $validated['key']).': '.$result['output']);
    }
}
