<?php

namespace App\Policies;

use App\Models\AcademicSession;
use App\Models\User;

class AcademicSessionPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('Super Administrator') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('sessions.view') || $user->hasPermissionTo('academic.view');
    }

    public function view(User $user, AcademicSession $session): bool
    {
        return $user->hasPermissionTo('sessions.view') || $user->hasPermissionTo('academic.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('sessions.create');
    }

    public function update(User $user, AcademicSession $session): bool
    {
        return $user->hasPermissionTo('sessions.edit');
    }

    public function activate(User $user, AcademicSession $session): bool
    {
        return $user->hasPermissionTo('sessions.activate');
    }

    public function delete(User $user, AcademicSession $session): bool
    {
        // Must have permission and cannot delete if referenced by terms or classes
        if (! $user->hasPermissionTo('sessions.delete')) {
            return false;
        }

        return ! $session->hasReferences();
    }
}
