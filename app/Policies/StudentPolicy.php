<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

/**
 * Student policy (Stage 5).
 *
 * Permissions gate the abilities, but record-level rules apply as well:
 * - A student may view ONLY their own student record (their own profile and
 *   permitted documents) and can never edit identity, admission or enrolment.
 * - A user holding students.view without students.view_all (a future
 *   assignment-based role such as a Form Master) is still denied the
 *   unrestricted directory; Stage 6 will layer assigned-class access on top.
 */
class StudentPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('Super Administrator')) {
            return true;
        }

        return null;
    }

    /**
     * Unrestricted directory access requires both the general permission and
     * the unrestricted-scope permission. Ordinary teachers hold neither.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('students.view')
            && ($user->hasPermissionTo('students.view_all')
                || $user->hasPermissionTo('students.view_class_lists'));
    }

    /**
     * Authorised staff with students.view, or the student viewing their own record.
     */
    public function view(User $user, Student $student): bool
    {
        if ($user->hasPermissionTo('students.view')) {
            return true;
        }

        // Student self-service: own profile only.
        return $student->user_id === $user->id;
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('students.edit')
            && $student->user_id !== $user->id; // never self-service editing
    }

    public function viewHistory(User $user, Student $student): bool
    {
        if ($student->user_id === $user->id) {
            return true; // students may see their own history summary
        }

        return $user->hasPermissionTo('students.view_history');
    }

    public function changeStatus(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('students.change_status')
            && $student->user_id !== $user->id;
    }

    public function viewDocuments(User $user, Student $student): bool
    {
        if ($student->user_id === $user->id) {
            return true; // permitted documents only — controller filters types
        }

        return $user->hasPermissionTo('students.view_documents');
    }

    public function manageDocuments(User $user, Student $student): bool
    {
        return $user->hasPermissionTo('students.manage_documents');
    }

    public function enrol(User $user): bool
    {
        return $user->hasPermissionTo('students.enrol');
    }

    public function transfer(User $user): bool
    {
        return $user->hasPermissionTo('students.transfer');
    }

    public function progress(User $user): bool
    {
        return $user->hasPermissionTo('students.progress');
    }

    /**
     * Class student lists. Only holders of students.view_class_lists may open
     * a class roster; teachers will be granted record-level access in Stage 6.
     */
    public function viewClassList(User $user): bool
    {
        return $user->hasPermissionTo('students.view_class_lists');
    }
}
