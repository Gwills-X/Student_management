<?php

namespace App\Policies;

use App\Models\ClassLevel;
use App\Models\User;

class ClassLevelPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('Super Administrator') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('class_levels.view') || $user->hasPermissionTo('academic.view');
    }

    public function view(User $user, ClassLevel $level): bool
    {
        return $user->hasPermissionTo('class_levels.view') || $user->hasPermissionTo('academic.view');
    }

    public function manage(User $user): bool
    {
        return $user->hasPermissionTo('class_levels.manage');
    }
}
