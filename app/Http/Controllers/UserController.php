<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of user accounts.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->only(['search', 'role', 'is_active', 'linked_status']);

        $users = User::query()
            ->with(['roles:id,name', 'employee:id,user_id,employee_number,first_name,last_name,job_title'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, function ($query, $role) {
                $query->role($role);
            })
            ->when(isset($filters['is_active']) && $filters['is_active'] !== '', function ($query) use ($filters) {
                $query->where('is_active', $filters['is_active'] === 'active' || $filters['is_active'] === '1' || $filters['is_active'] === true);
            })
            ->when($filters['linked_status'] ?? null, function ($query, $status) {
                if ($status === 'linked') {
                    $query->has('employee');
                } elseif ($status === 'standalone') {
                    $query->doesntHave('employee');
                }
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $currentUser = auth()->user();
        $rolesQuery = Role::query();
        if (! $currentUser->hasRole('Super Administrator')) {
            $rolesQuery->where('name', '!=', 'Super Administrator');
        }
        $availableRoles = $rolesQuery->pluck('name');

        $stats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'linked' => User::has('employee')->count(),
            'standalone' => User::doesntHave('employee')->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $filters,
            'availableRoles' => $availableRoles,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created standalone user account.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'alpha_num', 'min:3', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        // Security check
        if ($validated['role'] === 'Super Administrator' && ! auth()->user()->hasRole('Super Administrator')) {
            abort(403, 'Unauthorized to assign Super Administrator role.');
        }

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => $validated['password'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', "User account @{$user->username} was created successfully.");
    }

    /**
     * Update user details and role.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        // Super Administrator protection checks
        if ($user->hasRole('Super Administrator') && ! auth()->user()->hasRole('Super Administrator')) {
            abort(403, 'Unauthorized to modify a Super Administrator account.');
        }

        if ($validated['role'] === 'Super Administrator' && ! auth()->user()->hasRole('Super Administrator')) {
            abort(403, 'Unauthorized to grant Super Administrator role.');
        }

        // Prevent self-deactivation
        if (auth()->id() === $user->id && ! $request->boolean('is_active', true)) {
            return back()->with('error', 'You cannot deactivate your own user account.');
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'] ?? null;

        // Only update is_active if not a Super Administrator (Super Admins are always active)
        if (! $user->hasRole('Super Administrator')) {
            $user->is_active = $request->boolean('is_active', true);
        }

        $user->save();

        // Update role
        $user->syncRoles([$validated['role']]);

        return back()->with('success', "User @{$user->username} updated successfully.");
    }

    /**
     * Toggle active/inactive status for a user account.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        $this->authorize('toggleStatus', $user);

        $user->is_active = ! $user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User @{$user->username} has been {$status}.");
    }

    /**
     * Reset password for a user account.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $this->authorize('resetPassword', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->password = $validated['password'];
        $user->save();

        return back()->with('success', "Password for @{$user->username} was reset successfully.");
    }
}
