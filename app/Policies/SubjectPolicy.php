<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('Super Administrator') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('subjects.view') || $user->hasPermissionTo('academic.view');
    }

    public function view(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('subjects.view') || $user->hasPermissionTo('academic.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('subjects.create');
    }

    public function update(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('subjects.edit');
    }

    public function delete(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('subjects.delete');
    }
}
