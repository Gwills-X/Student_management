<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class EmployeeAccountController extends Controller
{
    /**
     * Create a new login account and link it to the employee.
     */
    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorize('manageAccount', $employee);

        if ($employee->user_id) {
            return back()->with('error', 'This employee already has an associated user account.');
        }

        $validated = $request->validate([
            'username' => ['required', 'string', 'alpha_num', 'min:3', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['boolean'],
        ]);

        // Security: ordinary administrators cannot create a Super Administrator account
        if ($validated['role'] === 'Super Administrator' && ! auth()->user()->hasRole('Super Administrator')) {
            abort(403, 'Unauthorized to grant Super Administrator role.');
        }

        DB::transaction(function () use ($validated, $employee, $request) {
            $user = User::create([
                'name' => $employee->full_name,
                'username' => $validated['username'],
                'email' => $validated['email'] ?? null,
                'password' => $validated['password'],
                'is_active' => $request->boolean('is_active', true),
            ]);

            $user->assignRole($validated['role']);

            $employee->user_id = $user->id;
            $employee->save();
        });

        return back()->with('success', "Login account for {$employee->full_name} created successfully (@{$validated['username']}).");
    }

    /**
     * Link an existing user account to this employee.
     */
    public function link(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorize('manageAccount', $employee);

        if ($employee->user_id) {
            return back()->with('error', 'This employee already has a linked account. Unlink the current account first.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $userId = $validated['user_id'];

        // Ensure user is not already linked to another employee
        if (Employee::where('user_id', $userId)->exists()) {
            return back()->with('error', 'The selected user account is already linked to another employee.');
        }

        $employee->user_id = $userId;
        $employee->save();

        $linkedUser = User::find($userId);

        return back()->with('success', "Linked account @{$linkedUser->username} to employee {$employee->full_name}.");
    }

    /**
     * Unlink the user account from this employee without deleting the user.
     */
    public function unlink(Employee $employee): RedirectResponse
    {
        $this->authorize('manageAccount', $employee);

        if (! $employee->user_id) {
            return back()->with('error', 'This employee has no linked account to unlink.');
        }

        $employee->user_id = null;
        $employee->save();

        return back()->with('success', "Account unlinked from {$employee->full_name}. The user record was preserved.");
    }

    /**
     * Toggle login account active/inactive status.
     */
    public function toggleActive(Employee $employee): RedirectResponse
    {
        if (! $employee->user) {
            return back()->with('error', 'This employee has no user account.');
        }

        $user = $employee->user;
        $this->authorize('toggleStatus', $user);

        $user->is_active = ! $user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Account @{$user->username} has been {$statusText}.");
    }

    /**
     * Reset the linked employee's account password.
     */
    public function resetPassword(Request $request, Employee $employee): RedirectResponse
    {
        if (! $employee->user) {
            return back()->with('error', 'This employee has no user account.');
        }

        $user = $employee->user;
        $this->authorize('resetPassword', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->password = $validated['password'];
        $user->save();

        return back()->with('success', "Password for @{$user->username} has been reset successfully.");
    }
}
