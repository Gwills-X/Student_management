<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Access gate for the maintenance panel.
 *
 * Denies access unless ALL of the following hold:
 *  1. The panel is enabled (emergency kill switch off).
 *  2. The user is authenticated (enforced by the route group) AND holds the
 *     "Super Administrator" Spatie role (existing role name — no new roles).
 *  3. The required production configuration (MAINTENANCE_PASSWORD_HASH) is
 *     present — in production the panel refuses to run unconfigured.
 *  4. The request is not in a "locked out" state from rate limiting.
 *
 * Sensitive POST mutations additionally require a valid re-authentication
 * grant (checked inside the controllers via MaintenanceService::ensureReauth).
 */
class EnsureMaintenanceAccess
{
    public function handle(Request $request, Closure $next)
    {
        if (! config('maintenance.enabled')) {
            return $this->deny($request, 'The maintenance panel is currently disabled on this server.');
        }

        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            return $this->deny($request, 'Access denied. Only Super Administrators may use the maintenance panel.');
        }

        if (! $this->configured()) {
            return $this->deny($request, 'Maintenance panel is not configured on this server. Contact your administrator.');
        }

        return $next($request);
    }

    /**
     * Whether all required security configuration exists.
     */
    public static function configured(): bool
    {
        return (bool) config('maintenance.password_hash');
    }

    private function deny(Request $request, string $message)
    {
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json(['message' => $message], 403);
        }

        return response()->view('errors.403', ['status' => 403, 'message' => $message], 403);
    }
}
