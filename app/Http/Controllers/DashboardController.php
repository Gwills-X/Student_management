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
     * Show the authenticated dashboard with school metrics.
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = AcademicTerm::where('is_current', true)->with('session')->first();

        $metrics = [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::where('employment_status', 'Active')->count(),
            'teaching_staff' => Employee::whereHas('category', fn ($q) => $q->where('name', 'Teaching Staff'))->count(),
            'non_teaching_staff' => Employee::whereHas('category', fn ($q) => $q->where('name', '!=', 'Teaching Staff'))->count(),
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),

            // Academic metrics (Stage 3)
            'current_session' => $currentSession ? $currentSession->name : 'None configured',
            'current_term' => $currentTerm ? $currentTerm->name : 'None configured',
            'total_stages' => EducationStage::where('is_active', true)->count(),
            'total_levels' => ClassLevel::where('is_active', true)->count(),
            'total_classes' => $currentSession ? SchoolClass::where('academic_session_id', $currentSession->id)->count() : SchoolClass::count(),
            'total_subjects' => Subject::where('is_active', true)->count(),
        ];

        // Recent employee registrations
        $recentEmployees = Employee::with(['category:id,name', 'user:id,username'])
            ->latest('id')
            ->take(5)
            ->get();

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
        ]);
    }
}
