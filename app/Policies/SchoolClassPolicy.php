<?php

namespace App\Policies;

use App\Models\SchoolClass;
use App\Models\User;

class SchoolClassPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('Super Administrator') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('classes.view') || $user->hasPermissionTo('academic.view');
    }

    public function view(User $user, SchoolClass $class): bool
    {
        return $user->hasPermissionTo('classes.view') || $user->hasPermissionTo('academic.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('classes.create');
    }

    public function update(User $user, SchoolClass $class): bool
    {
        return $user->hasPermissionTo('classes.edit');
    }

    public function delete(User $user, SchoolClass $class): bool
    {
        return $user->hasPermissionTo('classes.delete');
    }

    public function manageSubjects(User $user, SchoolClass $class): bool
    {
        return $user->hasPermissionTo('class_subjects.manage');
    }
}
