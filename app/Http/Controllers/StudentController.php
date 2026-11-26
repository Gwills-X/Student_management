<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Services\StudentEnrolmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class StudentController extends Controller
{
    public function __construct(private StudentEnrolmentService $enrolments)
    {
    }

    /**
     * Student directory (unrestricted scope).
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Student::class);

        $filters = $request->only([
            'search', 'status', 'academic_session_id', 'education_stage_id',
            'class_level_id', 'class_id', 'sort',
        ]);

        $students = Student::query()
            ->with([
                'user:id,username,name,is_active',
                'stage:id,name,code',
                'classLevel:id,name,education_stage_id',
                'application:id,first_name,middle_name,last_name',
            ])
            ->with([
                'enrolments' => fn ($q) => $q->with([
                    'schoolClass:id,name,arm,class_level_id',
                    'session:id,name',
                ])->orderByDesc('academic_session_id'),
            ])
            ->filter($filters)
            ->when(($filters['sort'] ?? null) === 'name', fn ($q) => $q->orderBy('admission_number'))
            ->when(($filters['sort'] ?? 'recent') === 'recent', fn ($q) => $q->orderByDesc('id'))
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $filters,
            'statuses' => Student::STATUSES,
            'sessions' => AcademicSession::orderByDesc('start_date')->get(['id', 'name']),
            'stages' => EducationStage::where('is_active', true)->orderBy('display_order')->get(['id', 'name']),
            'classLevels' => ClassLevel::where('is_active', true)->with('stage:id,name')->orderBy('progression_order')->get(['id', 'name', 'education_stage_id']),
            'classes' => SchoolClass::where('is_active', true)->orderBy('name')->get(['id', 'name', 'academic_session_id', 'class_level_id']),
            'can' => [
                'students.edit' => $request->user()->hasPermissionTo('students.edit'),
                'students.enrol' => $request->user()->hasPermissionTo('students.enrol'),
            ],
        ]);
    }

    /**
     * Student profile.
     */
    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $student->load([
            'user:id,username,name,email,is_active',
            'application.applicant:id,username',
            'application.classLevel:id,name',
            'stage:id,name,code',
            'classLevel:id,name,education_stage_id',
            'enrolments' => fn ($q) => $q->with([
                'schoolClass:id,name,arm,class_level_id',
                'classLevel:id,name',
                'session:id,name,is_current',
                'enrolledBy:id,name',
            ])->orderByDesc('academic_session_id'),
            'statusHistories.changer:id,name,username',
            'transferHistories' => fn ($q) => $q->with([
                'fromClass:id,name', 'toClass:id,name', 'transferredBy:id,name',
            ]),
            'updater:id,name',
        ]);

        $isOwner = $student->user_id === auth()->id();

        $user = auth()->user();

        return Inertia::render('Students/Show', [
            'student' => $student,
            'isOwner' => $isOwner,
            'statuses' => Student::STATUSES,
            // Actual classes for the admission session, for enrol/transfer pickers.
            'availableClasses' => SchoolClass::where('academic_session_id', $student->academic_session_id)
                ->where('is_active', true)
                ->with('classLevel:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'class_level_id', 'arm']),
            'academicSessions' => AcademicSession::orderByDesc('start_date')->get(['id', 'name']),
            'can' => [
                'students.edit' => $user->hasPermissionTo('students.edit') && ! $isOwner,
                'students.change_status' => $user->hasPermissionTo('students.change_status') && ! $isOwner,
                'students.view_history' => $user->hasPermissionTo('students.view_history') || $isOwner,
                'students.view_documents' => $user->hasPermissionTo('students.view_documents') || $isOwner,
                'students.manage_documents' => $user->hasPermissionTo('students.manage_documents') && ! $isOwner,
                'students.enrol' => $user->hasPermissionTo('students.enrol') && ! $isOwner,
                'students.transfer' => $user->hasPermissionTo('students.transfer') && ! $isOwner,
            ],
        ]);
    }

    /**
     * Edit permitted personal information.
     */
    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        return Inertia::render('Students/Edit', [
            'student' => $student->load('user:id,username,name,email,is_active'),
        ]);
    }

    /**
     * Update permitted personal / guardian information.
     * Permanent admission details (admission number, session, application)
     * are intentionally NOT editable here.
     */
    public function update(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('update', $student);

        $validated = $request->validate([
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:Male,Female,Other'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'state_of_origin' => ['nullable', 'string', 'max:100'],
            'lga' => ['nullable', 'string', 'max:100'],
            'residential_address' => ['nullable', 'string', 'max:1000'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'blood_group' => ['nullable', 'string', 'max:10'],
            'genotype' => ['nullable', 'string', 'max:10'],
            'medical_conditions' => ['nullable', 'string', 'max:2000'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_relationship' => ['nullable', 'string', 'max:50'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'guardian_address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
        ]);

        if ($request->hasFile('photo')) {
            if ($student->photo_path) {
                \Storage::disk('public')->delete($student->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('student_photos', 'public');
            unset($validated['photo']);
        }

        $validated['updated_by'] = $request->user()->id;
        $student->update($validated);

        return redirect()->route('students.show', $student)
            ->with('success', 'Student information updated successfully.');
    }

    /**
     * Change student lifecycle status (Active, Graduated, Withdrawn...).
     */
    public function changeStatus(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('changeStatus', $student);

        $validated = $request->validate([
            'status' => ['required', Rule::in(Student::STATUSES)],
            'remarks' => ['nullable', 'string', 'max:3000'],
        ]);

        try {
            $this->enrolments->changeStatus($student, $validated['status'], $validated['remarks'] ?? null, $request->user());
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back()->with('success', "Student status changed to {$validated['status']}.");
    }

    /**
     * Enrol a student into an actual class for a session (individual).
     */
    public function enrol(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('enrol', Student::class);

        $validated = $request->validate([
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'enrolment_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $this->enrolments->enrol($student, array_merge($validated, [
                'enrolled_by' => $request->user()->id,
            ]));
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['class_id' => $e->getMessage()]);
        }

        return back()->with('success', 'Student enrolled successfully.');
    }

    /**
     * Transfer a student to another actual class within the same session.
     */
    public function transfer(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('transfer', Student::class);

        $validated = $request->validate([
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'to_class_id' => ['required', 'exists:classes,id'],
            'transfer_date' => ['nullable', 'date'],
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $this->enrolments->transfer($student, array_merge($validated, [
                'transferred_by' => $request->user()->id,
            ]));
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['to_class_id' => $e->getMessage()]);
        }

        return back()->with('success', 'Student transferred successfully.');
    }

    /**
     * New-session progression workflow page: shows students from a previous
     * session and lets authorised staff enrol them into the next session.
     */
    public function progression(Request $request): Response
    {
        $this->authorize('progress', Student::class);

        $fromSessionId = $request->input('from_academic_session_id')
            ?? AcademicSession::orderByDesc('start_date')->value('id');

        $toSessionId = $request->input('academic_session_id')
            ?? AcademicSession::where('is_current', true)->value('id');

        $students = Student::query()
            ->with([
                'user:id,username,name',
                'application:id,first_name,middle_name,last_name',
                'enrolments' => fn ($q) => $q->with('schoolClass:id,name')
                    ->where('academic_session_id', $fromSessionId),
            ])
            ->when($fromSessionId, fn ($q, $id) => $q->whereHas('enrolments', fn ($e) => $e->where('academic_session_id', $id)))
            ->orderBy('id')
            ->paginate(50)
            ->withQueryString();

        $progressedIds = StudentEnrolment::where('academic_session_id', $toSessionId)
            ->whereIn('student_id', $students->getCollection()->pluck('id'))
            ->pluck('student_id')
            ->all();

        return Inertia::render('Students/Progression', [
            'students' => $students,
            'sessions' => AcademicSession::orderByDesc('start_date')->get(['id', 'name', 'is_current']),
            'fromSessionId' => (int) $fromSessionId,
            'toSessionId' => (int) $toSessionId,
            'classes' => SchoolClass::where('is_active', true)
                ->when($toSessionId, fn ($q) => $q->where('academic_session_id', $toSessionId))
                ->with('classLevel:id,name,education_stage_id')
                ->get(['id', 'name', 'class_level_id', 'arm']),
            'classLevels' => ClassLevel::where('is_active', true)
                ->with('stage:id,name')->orderBy('progression_order')
                ->get(['id', 'name', 'education_stage_id']),
            'progressedIds' => $progressedIds,
            'filters' => [
                'from_academic_session_id' => (int) $fromSessionId,
                'academic_session_id' => (int) $toSessionId,
            ],
        ]);
    }

    /**
     * Bulk progression into a new session.
     */
    public function bulkProgress(Request $request): RedirectResponse
    {
        $this->authorize('progress', Student::class);

        $validated = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer'],
            'from_academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $results = $this->enrolments->bulkProgress(
            $validated['student_ids'],
            [
                'from_academic_session_id' => $validated['from_academic_session_id'],
                'academic_session_id' => $validated['academic_session_id'],
                'class_id' => $validated['class_id'],
                'remarks' => $validated['remarks'] ?? null,
            ],
            $request->user()
        );

        $enrolledCount = count($results['enrolled']);
        $failedCount = count($results['failed']);

        $message = "{$enrolledCount} student(s) enrolled into the new session.";
        if ($failedCount > 0) {
            $message .= " {$failedCount} record(s) could not be enrolled: " .
                collect($results['failed'])->map(fn ($f) => ($f['name'] ?? "#{$f['student_id']}") . ' — ' . $f['error'])->implode('; ');
            return back()->with('warning', $message)->with('bulk_results', $results);
        }

        return back()->with('success', $message);
    }

    /**
     * Class student list for a single actual class.
     */
    public function classList(Request $request, SchoolClass $class): Response
    {
        $this->authorize('viewClassList', Student::class);

        $search = $request->input('search');
        $status = $request->input('status');

        $enrolments = StudentEnrolment::query()
            ->where('class_id', $class->id)
            ->where('academic_session_id', $class->academic_session_id)
            ->with([
                'student:id,admission_number,user_id,photo_path,admission_application_id,status',
                'student.user:id,username,name',
                'student.application:id,first_name,middle_name,last_name',
            ])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q) use ($search) {
                $q->whereHas('student', fn ($s) =>
                    $s->where('admission_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('username', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%"))
                        ->orWhereHas('application', fn ($a) => $a->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"))
                );
            })
            ->paginate(30)
            ->withQueryString();

        $class->load(['session:id,name,is_current', 'classLevel.stage:id,name,code']);

        return Inertia::render('Students/ClassList', [
            'class' => $class,
            'enrolments' => $enrolments,
            'filters' => ['search' => $search, 'status' => $status],
            'statuses' => StudentEnrolment::STATUSES,
        ]);
    }

    /**
     * Student portal: the authenticated student's own record.
     */
    public function myProfile(Request $request): Response
    {
        $student = Student::where('user_id', $request->user()->id)->firstOrFail();

        return $this->show($student);
    }
}
