<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorageController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function index()
    {
        return Inertia::render('Maintenance/Storage', [
            'link_status'  => $this->service->storageLinkStatus(),
            'writable'     => $this->service->writableDirectories(),
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * GET /admin/maintenance/storage/link — confirmation only.
     */
    public function confirm()
    {
        $status = $this->service->storageLinkStatus();

        return Inertia::render('Maintenance/ConfirmOperation', [
            'operation' => [
                'kind'     => 'storage.link',
                'label'    => 'Create / verify storage link',
                'command'  => 'php artisan storage:link (with safety checks)',
                'danger'   => false,
                'impact'   => 'Creates public/storage ONLY if it does not exist. Never overwrites a real directory or unrelated symlink. On hosts that block symlinks the operation reports failure honestly.',
                'payload'  => [],
                'endpoint' => route('maintenance.storage.link'),
                'back'     => route('maintenance.storage.index'),
            ],
            'status'       => $status,
            'reauth_valid' => $this->service->reauthValid(),
        ]);
    }

    /**
     * POST /admin/maintenance/storage/link
     * Creates public/storage symlink if safe to do so. Never overwrites a
     * real directory or an unrelated symlink.
     */
    public function link(Request $request)
    {
        if ($error = $this->service->reauthError()) {
            return back()->with('error', $error);
        }

        $result = $this->service->withLock('storage.link', null, function () {
            $status = $this->service->storageLinkStatus();

            // Safety: never touch a real directory.
            if ($status['is_dir']) {
                return [
                    'success' => false,
                    'output'  => 'public/storage already exists as a real directory. The storage link was NOT created or modified.',
                ];
            }

            // Safety: never overwrite an existing symlink that doesn't point at our storage.
            if ($status['is_link']) {
                $target = $status['points_to'] ?? '';

                if ($status['target_accessible'] && str_contains($target, 'storage')) {
                    return [
                        'success' => true,
                        'output'  => 'The storage link already exists and appears valid. No changes made.',
                    ];
                }

                return [
                    'success' => false,
                    'output'  => 'public/storage is a symlink but does not resolve correctly. Manual intervention required — it was NOT modified.',
                ];
            }

            $res = $this->service->runCommand('storage:link');

            if (! $res['success']) {
                return [
                    'success' => false,
                    'output'  => 'storage:link did not complete. On InfinityFree, symlink creation is often blocked — see the maintenance documentation for a manual alternative.',
                ];
            }

            // Verify after creation.
            $after = $this->service->storageLinkStatus();

            return [
                'success' => $after['exists'],
                'output'  => $after['exists']
                    ? 'Storage link created and verified.'
                    : 'storage:link reported success but the link was not verifiable afterwards.',
            ];
        });

        return back()->with($result['success'] ? 'success' : 'error', $result['output']);
    }
}
