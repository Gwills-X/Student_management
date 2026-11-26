<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\Employee;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the authenticated dashboard.
     *
     * Every metric / record block is computed only when the authenticated user
     * holds the corresponding Spatie permission, so nothing is leaked to
     * teachers, students or staff without the relevant authorisation. The
     * Inertia page renders whatever subset it receives.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canViewEmployees = $user->hasPermissionTo('employees.view');
        $canViewUsers = $user->hasPermissionTo('users.view');
        $canViewAcademic = $user->hasAnyPermission([
            'academic.view', 'sessions.view', 'terms.view', 'stages.view',
            'class_levels.view', 'classes.view', 'subjects.view',
        ]);
        $canManageClasses = $user->hasPermissionTo('classes.create');
        $canManageEmployees = $user->hasPermissionTo('employees.create');

        $metrics = [];

        if ($canViewEmployees) {
            $metrics['total_employees'] = Employee::count();
            $metrics['active_employees'] = Employee::where('employment_status', 'Active')->count();
            $metrics['teaching_staff'] = Employee::whereHas('category', fn ($q) => $q->where('name', 'Teaching Staff'))->count();
            $metrics['non_teaching_staff'] = Employee::whereHas('category', fn ($q) => $q->where('name', '!=', 'Teaching Staff'))->count();
        }

        if ($canViewUsers) {
            $metrics['total_users'] = User::count();
            $metrics['active_users'] = User::where('is_active', true)->count();
        }

        if ($canViewAcademic) {
            $currentSession = AcademicSession::where('is_current', true)->first();
            $currentTerm = AcademicTerm::where('is_current', true)->first();

            $metrics['current_session'] = $currentSession ? $currentSession->name : 'None configured';
            $metrics['current_term'] = $currentTerm ? $currentTerm->name : 'None configured';
            $metrics['total_stages'] = EducationStage::where('is_active', true)->count();
            $metrics['total_levels'] = ClassLevel::where('is_active', true)->count();
            $metrics['total_classes'] = $currentSession
                ? SchoolClass::where('academic_session_id', $currentSession->id)->count()
                : SchoolClass::count();
            $metrics['total_subjects'] = Subject::where('is_active', true)->count();
        }

        // Recent employee registrations — only for staff authorised to view them.
        $recentEmployees = collect();
        if ($canViewEmployees) {
            $recentEmployees = Employee::with(['category:id,name', 'user:id,username'])
                ->latest('id')
                ->take(5)
                ->get();
        }

        return Inertia::render('Dashboard', [
            'user' => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'roles'    => $user->getRoleNames(),
            ],
            'metrics' => $metrics,
            'recentEmployees' => $recentEmployees,
            'can' => [
                'employees.view'   => $canViewEmployees,
                'employees.create' => $canManageEmployees,
                'users.view'       => $canViewUsers,
                'classes.create'   => $canManageClasses,
            ],
        ]);
    }
}
