<?php

namespace App\Policies;

use App\Models\EducationStage;
use App\Models\User;

class EducationStagePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('Super Administrator') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('stages.view') || $user->hasPermissionTo('academic.view');
    }

    public function view(User $user, EducationStage $stage): bool
    {
        return $user->hasPermissionTo('stages.view') || $user->hasPermissionTo('academic.view');
    }

    public function manage(User $user): bool
    {
        return $user->hasPermissionTo('stages.manage');
    }
}
