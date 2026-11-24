<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
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
        return $user->hasPermissionTo('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('users.create');
    }

    public function update(User $user, User $model): bool
    {
        // Protected: Only Super Administrator can edit another Super Administrator
        if ($model->hasRole('Super Administrator') && ! $user->hasRole('Super Administrator')) {
            return false;
        }

        return $user->hasPermissionTo('users.edit');
    }

    public function delete(User $user, User $model): bool
    {
        // Protected: Super Administrator accounts can never be deleted
        if ($model->hasRole('Super Administrator')) {
            return false;
        }

        // Users cannot delete their own account
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermissionTo('users.delete');
    }

    public function toggleStatus(User $user, User $model): bool
    {
        // Protected: Super Administrator accounts can never be deactivated
        if ($model->hasRole('Super Administrator')) {
            return false;
        }

        // Users cannot deactivate their own account
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermissionTo('users.activate');
    }

    public function resetPassword(User $user, User $model): bool
    {
        // Protected: Only Super Administrator can reset password of another Super Administrator
        if ($model->hasRole('Super Administrator') && ! $user->hasRole('Super Administrator')) {
            return false;
        }

        return $user->hasPermissionTo('users.reset_password');
    }

    public function assignRoles(User $user, User $model, ?string $targetRole = null): bool
    {
        if (! $user->hasPermissionTo('roles.assign')) {
            return false;
        }

        // Only Super Administrator can assign or revoke the 'Super Administrator' role
        if ($targetRole === 'Super Administrator' && ! $user->hasRole('Super Administrator')) {
            return false;
        }

        // Cannot modify roles of a Super Administrator unless acting user is Super Administrator
        if ($model->hasRole('Super Administrator') && ! $user->hasRole('Super Administrator')) {
            return false;
        }

        return true;
    }
}
