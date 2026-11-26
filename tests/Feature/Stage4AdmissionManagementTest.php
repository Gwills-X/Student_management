<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\AdmissionApplication;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\AcademicStructureSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Stage4AdmissionManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(AcademicStructureSeeder::class);
    }

    private function registrar(): User
    {
        $user = User::factory()->create(['username' => 'registrar_' . uniqid()]);
        $user->assignRole('Registrar');
        return $user;
    }

    private function applicant(): User
    {
        return User::factory()->create([
            'username' => 'applicant_' . uniqid(),
            'email' => null,
        ]);
    }

    private function applicationPayload(User $applicant): array
    {
        $session = AcademicSession::current()->first();
        $level = ClassLevel::with('stage')->where('is_active', true)->first();

        return [
            'applicant_user_id' => $applicant->id,
            'academic_session_id' => $session->id,
            'education_stage_id' => $level->education_stage_id,
            'class_level_id' => $level->id,
            'application_date' => now()->toDateString(),
            'status' => 'Submitted',
            'first_name' => 'Test',
            'last_name' => 'Applicant',
        ];
    }

    public function test_registrar_can_create_applicant_without_email(): void
    {
        $registrar = $this->registrar();

        $response = $this->actingAs($registrar)->post('/admissions/applicants', [
            'name' => 'New Applicant',
            'username' => 'applicant' . uniqid(),
            'email' => null,
            'password' => 'password123',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['name' => 'New Applicant', 'email' => null]);
    }

    public function test_duplicate_username_is_rejected(): void
    {
        $registrar = $this->registrar();
        $applicant = $this->applicant();

        $response = $this->actingAs($registrar)->post('/admissions/applicants', [
            'name' => 'Duplicate',
            'username' => $applicant->username,
            'email' => null,
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors(['username']);
    }

    public function test_registrar_can_create_application_and_number_is_unique(): void
    {
        $registrar = $this->registrar();
        $applicant = $this->applicant();

        $this->actingAs($registrar)->post('/admissions/applications', $this->applicationPayload($applicant))
            ->assertSessionHas('success');

        $application = AdmissionApplication::first();
        $this->assertMatchesRegularExpression('/^APP\/\d{4}\/\d{4}$/', $application->application_number);
    }

    public function test_duplicate_application_is_rejected(): void
    {
        $registrar = $this->registrar();
        $applicant = $this->applicant();
        $payload = $this->applicationPayload($applicant);

        $this->actingAs($registrar)->post('/admissions/applications', $payload);
        $response = $this->actingAs($registrar)->post('/admissions/applications', $payload);

        $response->assertSessionHasErrors(['applicant_user_id']);
    }

    public function test_assessment_and_private_document_can_be_recorded(): void
    {
        Storage::fake('local');
        $registrar = $this->registrar();
        $applicant = $this->applicant();
        $this->actingAs($registrar)->post('/admissions/applications', $this->applicationPayload($applicant));
        $application = AdmissionApplication::first();

        $this->actingAs($registrar)->post("/admissions/applications/{$application->id}/assessments", [
            'assessment_type' => 'Entrance Examination',
            'assessment_date' => now()->toDateString(),
            'score' => 75,
            'maximum_score' => 100,
            'status' => 'Completed',
        ])->assertSessionHas('success');

        $this->actingAs($registrar)->post("/admissions/applications/{$application->id}/documents", [
            'title' => 'Birth Certificate',
            'document_type' => 'Birth Certificate',
            'document_file' => UploadedFile::fake()->create('birth.pdf', 100, 'application/pdf'),
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('admission_assessments', ['admission_application_id' => $application->id]);
        $this->assertDatabaseHas('admission_documents', ['admission_application_id' => $application->id]);
    }

    public function test_approved_application_converts_existing_user_to_student(): void
    {
        $registrar = $this->registrar();
        $applicant = $this->applicant();
        $this->actingAs($registrar)->post('/admissions/applications', $this->applicationPayload($applicant));
        $application = AdmissionApplication::first();

        $this->actingAs($registrar)->patch("/admissions/applications/{$application->id}/status", [
            'status' => 'Under Review',
        ]);
        $this->actingAs($registrar)->patch("/admissions/applications/{$application->id}/status", [
            'status' => 'Approved',
            'remarks' => 'Applicant meets requirements',
        ]);
        $this->actingAs($registrar)->post("/admissions/applications/{$application->id}/convert")
            ->assertSessionHas('success');

        $this->assertDatabaseHas('students', [
            'admission_application_id' => $application->id,
            'user_id' => $applicant->id,
        ]);
        $this->assertTrue($applicant->fresh()->hasRole('Student'));
        $this->assertDatabaseCount('users', 2 + 0);
    }

    public function test_rejected_application_cannot_be_converted(): void
    {
        $registrar = $this->registrar();
        $applicant = $this->applicant();
        $this->actingAs($registrar)->post('/admissions/applications', $this->applicationPayload($applicant));
        $application = AdmissionApplication::first();

        $this->actingAs($registrar)->patch("/admissions/applications/{$application->id}/status", [
            'status' => 'Under Review',
        ]);
        $this->actingAs($registrar)->patch("/admissions/applications/{$application->id}/status", [
            'status' => 'Rejected',
            'remarks' => 'Does not meet requirements',
        ]);

        $this->actingAs($registrar)->post("/admissions/applications/{$application->id}/convert")
            ->assertSessionHasErrors(['conversion']);
        $this->assertFalse(Student::where('admission_application_id', $application->id)->exists());
    }

    public function test_converted_application_cannot_be_converted_again(): void
    {
        $registrar = $this->registrar();
        $applicant = $this->applicant();
        $this->actingAs($registrar)->post('/admissions/applications', $this->applicationPayload($applicant));
        $application = AdmissionApplication::first();

        $this->actingAs($registrar)->patch("/admissions/applications/{$application->id}/status", ['status' => 'Under Review']);
        $this->actingAs($registrar)->patch("/admissions/applications/{$application->id}/status", ['status' => 'Approved']);
        $this->actingAs($registrar)->post("/admissions/applications/{$application->id}/convert");
        $this->actingAs($registrar)->post("/admissions/applications/{$application->id}/convert")
            ->assertSessionHasErrors(['conversion']);

        $this->assertDatabaseCount('students', 1);
    }
}
