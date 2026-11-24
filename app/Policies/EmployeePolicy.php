<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    /**
     * Intercept all checks: Super Administrator has all permissions.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('Super Administrator')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('employees.view');
    }

    public function view(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('employees.create');
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.edit');
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.delete');
    }

    public function updateStatus(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.status');
    }

    public function manageDocuments(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('employees.documents');
    }

    public function manageAccount(User $user, Employee $employee): bool
    {
        return $user->hasPermissionTo('users.create') || $user->hasPermissionTo('users.edit');
    }
}
