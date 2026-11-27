<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MigrationController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function index()
    {
        return Inertia::render('Maintenance/Migrations', [
            'status'       => $this->service->migrationStatus(),
            'db_connected' => $this->service->dbConnected(),
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * GET /admin/maintenance/migrations/run — confirmation page only.
     * Validates nothing here executes; no locks, no commands, no DB writes.
     */
    public function confirm()
    {
        return Inertia::render('Maintenance/ConfirmOperation', [
            'operation' => [
                'kind'     => 'migrations.run',
                'label'    => 'Run pending database migrations',
                'command'  => 'php artisan migrate --force',
                'danger'   => true,
                'impact'   => 'Executes all pending migrations against the PRODUCTION database and may permanently change data. Rollback/refresh/fresh/wipe commands are permanently blocked from this panel. Back up the database before continuing.',
                'payload'  => [],
                'endpoint' => route('maintenance.migrations.run'),
                'back'     => route('maintenance.migrations.index'),
            ],
            'status'       => $this->service->migrationStatus(),
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * POST /admin/maintenance/migrations/run
     * Requires re-authentication + lock. Migrate --force only.
     */
    public function run(Request $request)
    {
        if ($error = $this->service->reauthError()) {
            return back()->with('error', $error);
        }

        $result = $this->service->withLock('migrations.run', null, fn () => $this->service->runMigrations());

        $flash = $result['success'] ? 'success' : 'error';

        return back()->with($flash, $result['output']);
    }
}
