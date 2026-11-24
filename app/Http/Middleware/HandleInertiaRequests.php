<?php

/*
|--------------------------------------------------------------------------
| Inertia Shared Data Middleware
|--------------------------------------------------------------------------
|
| This middleware shares data with every Inertia response.
| In Stage 1 & 2 we share the authenticated user's info, roles,
| permissions and flash messages.
|
*/

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'username'       => $user->username,
                    'email'          => $user->email,
                    'roles'          => $user->getRoleNames(),
                    'permissions'    => $user->getAllPermissions()->pluck('name'),
                    'is_super_admin' => $user->hasRole('Super Administrator'),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
