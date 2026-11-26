<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdmissionApplicationRequest;
use App\Models\AcademicSession;
use App\Models\AdmissionApplication;
use App\Models\AdmissionStatusHistory;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\User;
use App\Services\AdmissionConverter;
use App\Services\AdmissionNumberGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AdmissionController extends Controller
{
    public function dashboard(): Response
    {
        $this->authorize('viewAny', AdmissionApplication::class);

        $stats = [
            'total' => AdmissionApplication::count(),
            'submitted' => AdmissionApplication::whereIn('status', ['Submitted', 'Under Review', 'Assessment Pending', 'Assessment Completed'])->count(),
            'approved' => AdmissionApplication::where('status', 'Approved')->count(),
            'rejected' => AdmissionApplication::where('status', 'Rejected')->count(),
            'converted' => AdmissionApplication::whereNotNull('converted_at')->count(),
        ];

        return Inertia::render('Admissions/Dashboard', [
            'stats' => $stats,
            'recentApplications' => AdmissionApplication::with(['applicant', 'academicSession', 'classLevel'])
                ->latest('id')->limit(8)->get(),
        ]);
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AdmissionApplication::class);

        $filters = $request->only(['search', 'status', 'academic_session_id', 'class_level_id']);
        $applications = AdmissionApplication::query()
            ->with(['applicant', 'academicSession', 'educationStage', 'classLevel'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('application_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhereHas('applicant', fn ($a) =>
                            $a->where('username', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                        );
                });
            })
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['academic_session_id'] ?? null, fn ($q, $id) => $q->where('academic_session_id', $id))
            ->when($filters['class_level_id'] ?? null, fn ($q, $id) => $q->where('class_level_id', $id))
            ->latest('id')->paginate(15)->withQueryString();

        return Inertia::render('Admissions/Index', [
            'applications' => $applications,
            'filters' => $filters,
            'statuses' => AdmissionApplication::STATUSES,
            'sessions' => AcademicSession::orderByDesc('start_date')->get(['id', 'name']),
            'classLevels' => ClassLevel::with('stage')->where('is_active', true)->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', AdmissionApplication::class);

        return Inertia::render('Admissions/Create', [
            'applicantUsers' => User::where('is_active', true)
                ->whereDoesntHave('employee')
                ->orderBy('name')->get(['id', 'name', 'username', 'email']),
            'sessions' => AcademicSession::orderByDesc('start_date')->get(['id', 'name']),
            'stages' => EducationStage::where('is_active', true)
                ->with(['classLevels' => fn ($q) => $q->where('is_active', true)])
                ->orderBy('display_order')->get(),
            'classLevels' => ClassLevel::with('stage')->where('is_active', true)->get(),
        ]);
    }

    public function store(StoreAdmissionApplicationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $duplicate = AdmissionApplication::where('applicant_user_id', $validated['applicant_user_id'])
            ->where('academic_session_id', $validated['academic_session_id'])
            ->where('class_level_id', $validated['class_level_id'])
            ->exists();

        if ($duplicate) {
            return back()->withErrors([
                'applicant_user_id' => 'An application already exists for this applicant, session and class level.',
            ]);
        }

        $application = DB::transaction(function () use ($validated, $request) {
            $applicationNumber = AdmissionNumberGenerator::applicationNumber((int) date('Y'));
            $status = $validated['status'] ?? 'Draft';

            $application = AdmissionApplication::create(array_merge($validated, [
                'application_number' => $applicationNumber,
                'status' => $status,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]));

            AdmissionStatusHistory::create([
                'admission_application_id' => $application->id,
                'from_status' => null,
                'to_status' => $status,
                'remarks' => 'Application created.',
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);

            return $application;
        });

        return redirect()->route('admissions.show', $application)
            ->with('success', "Application {$application->application_number} created successfully.");
    }

    public function show(AdmissionApplication $application): Response
    {
        $this->authorize('view', $application);

        $application->load([
            'applicant', 'academicSession', 'educationStage', 'classLevel',
            'assessments.assessor', 'documents.uploader', 'statusHistories.changer',
            'student', 'creator',
        ]);

        return Inertia::render('Admissions/Show', [
            'application' => $application,
            'statuses' => AdmissionApplication::STATUSES,
        ]);
    }

    public function storeApplicant(Request $request): RedirectResponse
    {
        $this->authorize('create', AdmissionApplication::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_num', 'min:3', 'max:50', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return back()->with('success', "Applicant account @{$user->username} created successfully.");
    }

    public function changeStatus(Request $request, AdmissionApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(AdmissionApplication::STATUSES)],
            'remarks' => ['nullable', 'string', 'max:3000'],
        ]);

        $target = $validated['status'];
        $allowed = [
            'Draft' => ['Submitted', 'Withdrawn'],
            'Submitted' => ['Under Review', 'Withdrawn'],
            'Under Review' => ['Assessment Pending', 'Approved', 'Rejected', 'Withdrawn'],
            'Assessment Pending' => ['Assessment Completed', 'Withdrawn'],
            'Assessment Completed' => ['Approved', 'Rejected', 'Withdrawn'],
        ];

        if (! in_array($target, $allowed[$application->status] ?? [], true)) {
            return back()->withErrors(['status' => "Invalid status transition from {$application->status} to {$target}."]);
        }

        if ($target === 'Approved') {
            $this->authorize('approve', $application);
        } elseif ($target === 'Rejected') {
            $this->authorize('reject', $application);
        } elseif ($target === 'Withdrawn') {
            $this->authorize('withdraw', $application);
        } else {
            $this->authorize('review', $application);
        }

        DB::transaction(function () use ($application, $target, $validated, $request) {
            $from = $application->status;
            $application->update([
                'status' => $target,
                'decision_remarks' => in_array($target, ['Approved', 'Rejected']) ? ($validated['remarks'] ?? null) : $application->decision_remarks,
                'decision_by' => in_array($target, ['Approved', 'Rejected']) ? $request->user()->id : $application->decision_by,
                'decision_at' => in_array($target, ['Approved', 'Rejected']) ? now() : $application->decision_at,
                'updated_by' => $request->user()->id,
            ]);

            AdmissionStatusHistory::create([
                'admission_application_id' => $application->id,
                'from_status' => $from,
                'to_status' => $target,
                'remarks' => $validated['remarks'] ?? null,
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);
        });

        return back()->with('success', "Application status changed to {$target}.");
    }

    public function convert(AdmissionApplication $application): RedirectResponse
    {
        $this->authorize('convert', $application);

        try {
            $student = AdmissionConverter::convert($application, auth()->user());
        } catch (RuntimeException $exception) {
            return back()->withErrors(['conversion' => $exception->getMessage()]);
        }

        return back()->with('success', "Applicant converted successfully. Student number: {$student->admission_number}");
    }
}
