<?php

namespace App\Policies;

use App\Models\AcademicTerm;
use App\Models\User;

class AcademicTermPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('Super Administrator') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('terms.view') || $user->hasPermissionTo('academic.view');
    }

    public function view(User $user, AcademicTerm $term): bool
    {
        return $user->hasPermissionTo('terms.view') || $user->hasPermissionTo('academic.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('terms.create');
    }

    public function update(User $user, AcademicTerm $term): bool
    {
        return $user->hasPermissionTo('terms.edit');
    }

    public function activate(User $user, AcademicTerm $term): bool
    {
        return $user->hasPermissionTo('terms.activate');
    }

    public function delete(User $user, AcademicTerm $term): bool
    {
        return $user->hasPermissionTo('terms.delete');
    }
}
