<?php

namespace App\Policies;

use App\Models\AdmissionApplication;
use App\Models\User;

class AdmissionApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('admissions.view');
    }

    public function view(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.view');
    }

    public function create(User $user): bool
    {
        return $user->can('admissions.create');
    }

    public function update(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.edit') && ! $application->isConverted();
    }

    public function assess(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.assess');
    }

    public function manageDocuments(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.manage_documents');
    }

    public function review(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.review');
    }

    public function approve(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.approve');
    }

    public function reject(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.reject');
    }

    public function withdraw(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.withdraw');
    }

    public function convert(User $user, AdmissionApplication $application): bool
    {
        return $user->can('admissions.convert');
    }
}
