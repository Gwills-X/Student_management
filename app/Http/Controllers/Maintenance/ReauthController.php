<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Deployment-password re-authentication endpoint.
 *
 * The password is only ever checked server-side against the bcrypt hash in
 * config. It is never stored, logged or echoed back.
 */
class ReauthController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function create()
    {
        return Inertia::render('Maintenance/Reauthenticate', [
            'reauth_valid' => $this->service->reauthValid(),
            'lifetime'     => (int) config('maintenance.reauth_lifetime', 900),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'max:1024'],
        ]);

        if (! $this->service->verifyDeploymentPassword($validated['password'])) {
            // Log the failure WITHOUT the password itself.
            $this->service->record('reauth.failed', false, 'Invalid deployment password attempt.');

            return back()
                ->withInput()
                ->with('error', 'Invalid deployment password.');
        }

        $this->service->grantReauth();
        $this->service->record('reauth.granted', true, 'Deployment password accepted.');

        return redirect()->route('maintenance.dashboard')
            ->with('success', 'Re-authentication successful. Sensitive operations are unlocked for '.now()->addSeconds((int) config('maintenance.reauth_lifetime'))->diffForHumans(['parts' => 1]).'.');
    }
}
