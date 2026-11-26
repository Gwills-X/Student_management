<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\ClassLevel;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\AcademicStructureSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Stage 5: Student Management & Enrolment tests.
 */
class Stage5StudentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(AcademicStructureSeeder::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function staffWithRole(string $role, array $extraPermissions = []): User
    {
        $user = User::factory()->create(['username' => 'staff_' . uniqid()]);
        $user->assignRole($role);
        foreach ($extraPermissions as $permission) {
            $user->givePermissionTo($permission);
        }
        return $user;
    }

    private function createStudent(?User $user = null): Student
    {
        $session = AcademicSession::current()->first();
        $level = ClassLevel::where('is_active', true)->first();

        $applicant = $user ?? User::factory()->create(['username' => 'stud_' . uniqid()]);

        $application = \App\Models\AdmissionApplication::create([
            'application_number' => 'APP/' . date('Y') . '/' . uniqid(),
            'applicant_user_id' => $applicant->id,
            'academic_session_id' => $session->id,
            'education_stage_id' => $level->education_stage_id,
            'class_level_id' => $level->id,
            'application_date' => now()->toDateString(),
            'status' => 'Approved',
            'first_name' => 'Test',
            'last_name' => 'Student ' . uniqid(),
            'created_by' => $applicant->id,
        ]);

        return Student::create([
            'admission_number' => 'ADM/' . date('Y') . '/' . uniqid(),
            'user_id' => $applicant->id,
            'academic_session_id' => $session->id,
            'education_stage_id' => $level->education_stage_id,
            'class_level_id' => $level->id,
            'admission_application_id' => $application->id,
            'admission_date' => now()->toDateString(),
            'status' => 'Active',
        ]);
    }

    private function classFor(AcademicSession $session, ?ClassLevel $level = null, ?string $arm = null): SchoolClass
    {
        $level = $level ?? ClassLevel::where('is_active', true)->first();

        return SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => $arm,
            'name' => $level->name . ($arm ? $arm : ''),
            'is_active' => true,
        ]);
    }

    private function otherSession(): AcademicSession
    {
        return AcademicSession::create([
            'name' => '2030/2031-' . uniqid(),
            'start_date' => '2030-09-01',
            'end_date' => '2031-07-30',
            'status' => 'upcoming',
            'is_current' => false,
        ]);
    }

    // ── Student records ──────────────────────────────────────────────────

    public function test_authorized_administrator_can_view_student_directory(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $this->createStudent();

        $this->actingAs($admin)->get('/students')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Students/Index'));
    }

    public function test_teacher_cannot_access_unrestricted_student_directory(): void
    {
        $teacher = $this->staffWithRole('Teacher');

        $this->actingAs($teacher)->get('/students')->assertStatus(403);
    }

    public function test_student_can_view_only_their_own_profile(): void
    {
        $studentUser = User::factory()->create(['username' => 'self_' . uniqid()]);
        $studentUser->assignRole('Student');
        $own = $this->createStudent($studentUser);
        $other = $this->createStudent();

        // Own profile via portal route
        $this->actingAs($studentUser)->get('/my-student-profile')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Students/Show'));

        // Cannot view another student's profile
        $this->actingAs($studentUser)->get("/students/{$other->id}")->assertStatus(403);
    }

    public function test_authorized_staff_can_update_permitted_student_information(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();

        $this->actingAs($admin)->put("/students/{$student->id}", [
            'guardian_name' => 'New Guardian',
            'guardian_phone' => '08012345678',
            'residential_address' => '12 Unity Road',
        ])->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'guardian_name' => 'New Guardian',
        ]);
    }

    public function test_student_cannot_edit_their_permanent_record(): void
    {
        $studentUser = User::factory()->create(['username' => 'self_' . uniqid()]);
        $studentUser->assignRole('Student');
        $student = $this->createStudent($studentUser);

        $this->actingAs($studentUser)
            ->put("/students/{$student->id}", ['guardian_name' => 'Hacked'])
            ->assertStatus(403);

        $this->assertDatabaseMissing('students', [
            'id' => $student->id,
            'guardian_name' => 'Hacked',
        ]);
    }

    public function test_student_record_remains_available_after_account_deactivation(): void
    {
        $student = $this->createStudent();
        $student->user->update(['is_active' => false]);

        $this->assertDatabaseHas('students', ['id' => $student->id, 'status' => 'Active']);
        $this->assertNotNull(Student::find($student->id)->user);
    }

    public function test_graduated_students_retain_their_records(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();

        $this->actingAs($admin)->patch("/students/{$student->id}/status", [
            'status' => 'Graduated',
            'remarks' => 'Completed SS3.',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('students', ['id' => $student->id, 'status' => 'Graduated']);
        $this->assertDatabaseHas('student_status_histories', [
            'student_id' => $student->id,
            'to_status' => 'Graduated',
        ]);
    }

    public function test_status_change_is_recorded_with_responsible_staff(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();

        $this->actingAs($admin)->patch("/students/{$student->id}/status", [
            'status' => 'Withdrawn',
            'remarks' => 'Relocated.',
        ]);

        $this->assertDatabaseHas('student_status_histories', [
            'student_id' => $student->id,
            'from_status' => 'Active',
            'to_status' => 'Withdrawn',
            'changed_by' => $admin->id,
        ]);
    }

    // ── Enrolment ────────────────────────────────────────────────────────

    public function test_authorized_administrator_can_enrol_a_student_into_an_actual_class(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $class = $this->classFor($session);

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $class->id,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('student_enrolments', [
            'student_id' => $student->id,
            'academic_session_id' => $session->id,
            'class_id' => $class->id,
            'status' => 'Active',
            'enrolled_by' => $admin->id,
        ]);
    }

    public function test_enrolment_rejects_class_from_a_different_session(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $otherSession = $this->otherSession();
        $class = $this->classFor($otherSession);
        $currentSession = AcademicSession::current()->first();

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $currentSession->id,
            'class_id' => $class->id,
        ])->assertSessionHasErrors(['class_id']);

        $this->assertDatabaseMissing('student_enrolments', ['student_id' => $student->id]);
    }

    public function test_student_cannot_have_duplicate_enrolments_in_same_session(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $classA = $this->classFor($session, null, 'A');
        $classB = $this->classFor($session, null, 'B');

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $classA->id,
        ])->assertSessionHas('success');

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $classB->id,
        ])->assertSessionHasErrors(['class_id']);

        $this->assertDatabaseCount('student_enrolments', 1);
    }

    public function test_classes_without_arms_and_with_arms_both_work(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $session = AcademicSession::current()->first();
        $level = ClassLevel::where('is_active', true)->first();

        $noArmStudent = $this->createStudent();
        $armStudent = $this->createStudent();
        $noArmClass = $this->classFor($session, $level, null);
        $armClass = $this->classFor($session, $level, 'B');

        $this->actingAs($admin)->post("/students/{$noArmStudent->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $noArmClass->id,
        ])->assertSessionHas('success');

        $this->actingAs($admin)->post("/students/{$armStudent->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $armClass->id,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('student_enrolments', ['class_id' => $noArmClass->id]);
        $this->assertDatabaseHas('student_enrolments', ['class_id' => $armClass->id]);
    }

    public function test_inactive_class_cannot_accept_enrolment(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $class = $this->classFor($session);
        $class->update(['is_active' => false]);

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $class->id,
        ])->assertSessionHasErrors(['class_id']);
    }

    // ── Transfers ────────────────────────────────────────────────────────

    public function test_authorized_staff_can_transfer_student_between_classes(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $classA = $this->classFor($session, null, 'A');
        $classB = $this->classFor($session, null, 'B');

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $classA->id,
        ]);

        $this->actingAs($admin)->post("/students/{$student->id}/transfer", [
            'academic_session_id' => $session->id,
            'to_class_id' => $classB->id,
            'reason' => 'Balancing class sizes.',
        ])->assertSessionHas('success');

        // Enrolment now points to the destination class; no duplicate row created.
        $this->assertDatabaseHas('student_enrolments', [
            'student_id' => $student->id,
            'class_id' => $classB->id,
        ]);
        $this->assertDatabaseCount('student_enrolments', 1);

        // Transfer history preserves the previous class and responsible staff.
        $this->assertDatabaseHas('student_transfer_histories', [
            'student_id' => $student->id,
            'from_class_id' => $classA->id,
            'to_class_id' => $classB->id,
            'transferred_by' => $admin->id,
            'reason' => 'Balancing class sizes.',
        ]);
    }

    public function test_transfer_rejects_destination_class_in_other_session(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $classA = $this->classFor($session);
        $otherSession = $this->otherSession();
        $foreignClass = $this->classFor($otherSession);

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $classA->id,
        ]);

        $this->actingAs($admin)->post("/students/{$student->id}/transfer", [
            'academic_session_id' => $session->id,
            'to_class_id' => $foreignClass->id,
        ])->assertSessionHasErrors(['to_class_id']);

        $this->assertDatabaseMissing('student_transfer_histories', ['student_id' => $student->id]);
    }

    public function test_unauthorized_teacher_cannot_transfer_students(): void
    {
        $teacher = $this->staffWithRole('Teacher');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $classA = $this->classFor($session, null, 'A');
        $classB = $this->classFor($session, null, 'B');

        $this->actingAs($teacher)->post("/students/{$student->id}/transfer", [
            'academic_session_id' => $session->id,
            'to_class_id' => $classB->id,
        ])->assertStatus(403);
    }

    public function test_teacher_cannot_enrol_students(): void
    {
        $teacher = $this->staffWithRole('Teacher');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $class = $this->classFor($session);

        $this->actingAs($teacher)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $class->id,
        ])->assertStatus(403);

        $this->assertDatabaseCount('student_enrolments', 0);
    }

    // ── Progression ──────────────────────────────────────────────────────

    public function test_authorized_staff_can_progress_student_to_new_session(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $fromSession = AcademicSession::current()->first();
        $toSession = $this->otherSession();

        $oldClass = $this->classFor($fromSession);
        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $fromSession->id,
            'class_id' => $oldClass->id,
        ]);

        $newClass = $this->classFor($toSession);

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $toSession->id,
            'class_id' => $newClass->id,
        ])->assertSessionHas('success');

        // Both enrolments exist; previous session's record remains intact
        // but is marked Completed.
        $this->assertDatabaseCount('student_enrolments', 2);
        $this->assertDatabaseHas('student_enrolments', [
            'student_id' => $student->id,
            'academic_session_id' => $fromSession->id,
            'status' => 'Completed',
        ]);
        $this->assertDatabaseHas('student_enrolments', [
            'student_id' => $student->id,
            'academic_session_id' => $toSession->id,
            'status' => 'Active',
        ]);
    }

    public function test_bulk_progression_skips_invalid_records_safely(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $fromSession = AcademicSession::current()->first();
        $toSession = $this->otherSession();

        $enrolledStudent = $this->createStudent();
        $oldClass = $this->classFor($fromSession);
        $this->actingAs($admin)->post("/students/{$enrolledStudent->id}/enrol", [
            'academic_session_id' => $fromSession->id,
            'class_id' => $oldClass->id,
        ]);

        $newClass = $this->classFor($toSession);

        $this->actingAs($admin)->post('/students/progression/bulk', [
            'student_ids' => [$enrolledStudent->id, 999999],
            'from_academic_session_id' => $fromSession->id,
            'academic_session_id' => $toSession->id,
            'class_id' => $newClass->id,
        ])->assertSessionHas('warning');

        // Valid student enrolled, invalid skipped without aborting.
        $this->assertDatabaseHas('student_enrolments', [
            'student_id' => $enrolledStudent->id,
            'academic_session_id' => $toSession->id,
        ]);
        $this->assertDatabaseMissing('student_enrolments', ['student_id' => 999999]);
    }

    public function test_bulk_progression_prevents_duplicate_enrolments(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $fromSession = AcademicSession::current()->first();
        $toSession = $this->otherSession();

        $student = $this->createStudent();
        $oldClass = $this->classFor($fromSession);
        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $fromSession->id,
            'class_id' => $oldClass->id,
        ]);

        $newClass = $this->classFor($toSession);
        $payload = [
            'student_ids' => [$student->id],
            'from_academic_session_id' => $fromSession->id,
            'academic_session_id' => $toSession->id,
            'class_id' => $newClass->id,
        ];

        $this->actingAs($admin)->post('/students/progression/bulk', $payload);
        $this->actingAs($admin)->post('/students/progression/bulk', $payload)->assertSessionHas('warning');

        $this->assertDatabaseCount('student_enrolments', 2);
    }

    // ── Class lists & documents ─────────────────────────────────────────

    public function test_authorized_user_can_view_class_student_list(): void
    {
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $session = AcademicSession::current()->first();
        $class = $this->classFor($session);

        $this->actingAs($admin)->post("/students/{$student->id}/enrol", [
            'academic_session_id' => $session->id,
            'class_id' => $class->id,
        ]);

        $this->actingAs($admin)->get("/academic/classes/{$class->id}/students")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Students/ClassList'));
    }

    public function test_teacher_cannot_view_class_student_list(): void
    {
        $teacher = $this->staffWithRole('Teacher');
        $session = AcademicSession::current()->first();
        $class = $this->classFor($session);

        $this->actingAs($teacher)->get("/academic/classes/{$class->id}/students")->assertStatus(403);
    }

    public function test_student_documents_are_private_and_authorized(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();
        $otherStudent = $this->createStudent();

        $this->actingAs($admin)->post("/students/{$student->id}/documents", [
            'title' => 'Medical Report',
            'document_type' => 'Medical Report',
            'document_file' => \Illuminate\Http\UploadedFile::fake()->create('report.pdf', 100, 'application/pdf'),
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('student_documents', ['student_id' => $student->id]);
        $storedPath = $student->documents()->first()->file_path;
        $this->assertStringStartsWith('student_documents/' . $student->id . '/', $storedPath);
        \Illuminate\Support\Facades\Storage::disk('local')->assertExists($storedPath);
    }

    public function test_student_cannot_upload_or_delete_documents(): void
    {
        $studentUser = User::factory()->create(['username' => 'self_' . uniqid()]);
        $studentUser->assignRole('Student');
        $student = $this->createStudent($studentUser);

        $this->actingAs($studentUser)->post("/students/{$student->id}/documents", [
            'title' => 'Self Upload',
            'document_type' => 'Other',
            'document_file' => \Illuminate\Http\UploadedFile::fake()->create('self.pdf', 100, 'application/pdf'),
        ])->assertStatus(403);
    }

    public function test_unauthorized_user_cannot_view_private_student_document(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $admin = $this->staffWithRole('Administrator');
        $student = $this->createStudent();

        $this->actingAs($admin)->post("/students/{$student->id}/documents", [
            'title' => 'Report',
            'document_type' => 'Other',
            'document_file' => \Illuminate\Http\UploadedFile::fake()->create('report.pdf', 100, 'application/pdf'),
        ]);
        $document = $student->documents()->first();

        $outsider = $this->staffWithRole('Teacher');
        $this->actingAs($outsider)
            ->get("/students/{$student->id}/documents/{$document->id}/view")
            ->assertStatus(403);
    }
}
