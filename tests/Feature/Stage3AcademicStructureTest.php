<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\AcademicStructureSeeder;
use Database\Seeders\EmployeeCategoriesSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Stage3AcademicStructureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(EmployeeCategoriesSeeder::class);
        $this->seed(AcademicStructureSeeder::class);
    }

    protected function createAdmin(): User
    {
        $admin = User::factory()->create([
            'username' => 'admin_' . uniqid(),
            'is_active' => true,
        ]);
        $admin->assignRole('Administrator');

        return $admin;
    }

    protected function createSuperAdmin(): User
    {
        $superAdmin = User::factory()->create([
            'username' => 'superadmin_' . uniqid(),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('Super Administrator');

        return $superAdmin;
    }

    protected function createPlainUser(): User
    {
        return User::factory()->create([
            'username' => 'user_' . uniqid(),
            'is_active' => true,
        ]);
    }

    // ── Academic Sessions ──────────────────────────────────────────────────

    public function test_admin_can_create_academic_session(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->post('/academic/sessions', [
            'name' => '2027/2028',
            'start_date' => '2027-09-01',
            'end_date' => '2028-07-31',
            'status' => 'Upcoming',
            'description' => 'Academic session for 2027/2028',
        ]);

        $newSession = AcademicSession::where('name', '2027/2028')->first();
        $response->assertRedirect(route('academic.sessions.show', $newSession));
        $this->assertDatabaseHas('academic_sessions', [
            'name' => '2027/2028',
            'status' => 'upcoming',
            'is_current' => false,
        ]);
    }

    public function test_academic_session_requires_unique_name(): void
    {
        $admin = $this->createAdmin();

        // 2026/2027 is seeded
        $response = $this->actingAs($admin)->post('/academic/sessions', [
            'name' => '2026/2027',
            'start_date' => '2026-09-01',
            'end_date' => '2027-07-31',
            'status' => 'Active',
        ]);

        $response->assertSessionHasErrors(['name']);
    }

    public function test_academic_session_validates_dates(): void
    {
        $admin = $this->createAdmin();

        // end_date before start_date
        $response = $this->actingAs($admin)->post('/academic/sessions', [
            'name' => '2028/2029',
            'start_date' => '2028-09-01',
            'end_date' => '2028-08-01',
            'status' => 'Upcoming',
        ]);

        $response->assertSessionHasErrors(['end_date']);
    }

    public function test_only_one_session_can_be_current(): void
    {
        $admin = $this->createAdmin();

        $session1 = AcademicSession::where('is_current', true)->first();
        $this->assertNotNull($session1);

        $session2 = AcademicSession::create([
            'name' => '2027/2028',
            'start_date' => '2027-09-01',
            'end_date' => '2028-07-31',
            'status' => 'Upcoming',
            'is_current' => false,
        ]);

        $response = $this->actingAs($admin)->patch("/academic/sessions/{$session2->id}/make-current");
        $response->assertSessionHas('success');

        $this->assertTrue($session2->fresh()->is_current);
        $this->assertEquals('active', $session2->fresh()->status);
        $this->assertFalse($session1->fresh()->is_current);
    }

    // ── Academic Terms ─────────────────────────────────────────────────────

    public function test_admin_can_create_academic_term(): void
    {
        $admin = $this->createAdmin();

        $session = AcademicSession::create([
            'name' => '2028/2029',
            'start_date' => '2028-09-01',
            'end_date' => '2029-07-31',
            'status' => 'Upcoming',
            'is_current' => false,
        ]);

        $response = $this->actingAs($admin)->post("/academic/sessions/{$session->id}/terms", [
            'name' => 'First Term',
            'term_order' => 1,
            'start_date' => '2028-09-05',
            'end_date' => '2028-12-15',
            'status' => 'Upcoming',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('academic_terms', [
            'academic_session_id' => $session->id,
            'name' => 'First Term',
            'term_order' => 1,
        ]);
    }

    public function test_academic_term_must_fall_within_session_dates(): void
    {
        $admin = $this->createAdmin();

        $session = AcademicSession::create([
            'name' => '2029/2030',
            'start_date' => '2029-09-01',
            'end_date' => '2030-07-31',
            'status' => 'Upcoming',
            'is_current' => false,
        ]);

        // Term start_date before session start_date
        $response = $this->actingAs($admin)->post("/academic/sessions/{$session->id}/terms", [
            'name' => 'Early Term',
            'term_order' => 1,
            'start_date' => '2029-08-01',
            'end_date' => '2029-12-15',
            'status' => 'Upcoming',
        ]);

        $response->assertSessionHasErrors(['start_date']);
    }

    public function test_overlapping_term_dates_are_rejected(): void
    {
        $admin = $this->createAdmin();

        $session = AcademicSession::create([
            'name' => '2030/2031',
            'start_date' => '2030-09-01',
            'end_date' => '2031-07-31',
            'status' => 'Upcoming',
            'is_current' => false,
        ]);

        AcademicTerm::create([
            'academic_session_id' => $session->id,
            'name' => 'First Term',
            'term_order' => 1,
            'start_date' => '2030-09-10',
            'end_date' => '2030-12-20',
            'status' => 'Upcoming',
        ]);

        // Second term overlaps with first term
        $response = $this->actingAs($admin)->post("/academic/sessions/{$session->id}/terms", [
            'name' => 'Second Term',
            'term_order' => 2,
            'start_date' => '2030-12-10',
            'end_date' => '2031-04-10',
            'status' => 'Upcoming',
        ]);

        $response->assertSessionHasErrors(['start_date']);
    }

    public function test_only_one_term_can_be_current_across_the_school(): void
    {
        $admin = $this->createAdmin();

        $currentTerm = AcademicTerm::where('is_current', true)->first();
        $this->assertNotNull($currentTerm);

        $otherTerm = AcademicTerm::where('is_current', false)->first();
        $this->assertNotNull($otherTerm);

        $response = $this->actingAs($admin)->patch("/academic/terms/{$otherTerm->id}/make-current");
        $response->assertSessionHas('success');

        $this->assertTrue($otherTerm->fresh()->is_current);
        $this->assertFalse($currentTerm->fresh()->is_current);
        $this->assertEquals(1, AcademicTerm::where('is_current', true)->count());
    }

    // ── Education Stages & Class Levels ────────────────────────────────────

    public function test_education_stages_and_levels_are_configured_with_order(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->get('/academic/structure');
        $response->assertOk();

        // 4 stages seeded
        $this->assertEquals(4, EducationStage::count());

        // JSS stage has JSS 1, JSS 2, JSS 3
        $jssStage = EducationStage::where('code', 'JSS')->first();
        $this->assertNotNull($jssStage);
        $levels = $jssStage->classLevels()->orderBy('progression_order')->get();
        $this->assertCount(3, $levels);
        $this->assertEquals('JSS 1', $levels[0]->name);
        $this->assertEquals('JSS 2', $levels[1]->name);
        $this->assertEquals('JSS 3', $levels[2]->name);
    }

    public function test_admin_can_add_class_level_under_stage(): void
    {
        $admin = $this->createAdmin();
        $stage = EducationStage::where('code', 'PRI')->first();

        $response = $this->actingAs($admin)->post('/academic/levels', [
            'education_stage_id' => $stage->id,
            'name' => 'Primary 7',
            'code' => 'PRI7',
            'progression_order' => 7,
            'description' => 'Optional extra primary year',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_levels', [
            'education_stage_id' => $stage->id,
            'code' => 'PRI7',
        ]);
    }

    // ── Session-Specific Classes & Arms ────────────────────────────────────

    public function test_admin_can_create_class_without_an_arm(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();

        // Administrator creates a single class without any arm
        $response = $this->actingAs($admin)->post('/academic/classes', [
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => null, // No arm
            'classroom' => 'Main Hall',
            'capacity' => 35,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('classes', [
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => null,
            'name' => 'JSS 1',
        ]);
    }

    public function test_admin_can_create_class_with_an_arm(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();

        // Administrator creates JSS 1A
        $response = $this->actingAs($admin)->post('/academic/classes', [
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'A',
            'classroom' => 'Hall 1',
            'capacity' => 40,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('classes', [
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'A',
            'name' => 'JSS 1A',
        ]);
    }

    public function test_admin_can_create_multiple_arms_and_custom_arm_names(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();

        // Create JSS 1A, JSS 1B, and custom arm JSS 1 Gold
        $arms = ['A', 'B', 'Gold'];
        foreach ($arms as $arm) {
            $response = $this->actingAs($admin)->post('/academic/classes', [
                'academic_session_id' => $session->id,
                'class_level_id' => $level->id,
                'arm' => $arm,
            ]);
            $response->assertSessionHas('success');
        }

        $this->assertDatabaseHas('classes', [
            'academic_session_id' => $session->id,
            'arm' => 'A',
            'name' => 'JSS 1A',
        ]);
        $this->assertDatabaseHas('classes', [
            'academic_session_id' => $session->id,
            'arm' => 'B',
            'name' => 'JSS 1B',
        ]);
        $this->assertDatabaseHas('classes', [
            'academic_session_id' => $session->id,
            'arm' => 'Gold',
            'name' => 'JSS 1 Gold',
        ]);
    }

    public function test_classes_are_session_specific_and_distinct_across_sessions(): void
    {
        $session1 = AcademicSession::where('is_current', true)->first();
        $session2 = AcademicSession::create([
            'name' => '2027/2028',
            'start_date' => '2027-09-01',
            'end_date' => '2028-07-31',
            'status' => 'Upcoming',
            'is_current' => false,
        ]);
        $level = ClassLevel::where('code', 'JSS1')->first();

        // Create JSS 1 in session 1 without arm
        $class1 = SchoolClass::create([
            'academic_session_id' => $session1->id,
            'class_level_id' => $level->id,
            'arm' => null,
            'name' => 'JSS 1',
            'capacity' => 35,
            'is_active' => true,
        ]);

        // Create JSS 1 in session 2 without arm — this MUST succeed because sessions are distinct!
        $class2 = SchoolClass::create([
            'academic_session_id' => $session2->id,
            'class_level_id' => $level->id,
            'arm' => null,
            'name' => 'JSS 1',
            'capacity' => 35,
            'is_active' => true,
        ]);

        $this->assertNotEquals($class1->id, $class2->id);
        $this->assertEquals('JSS 1', $class1->name);
        $this->assertEquals('JSS 1', $class2->name);
        $this->assertEquals($session1->id, $class1->academic_session_id);
        $this->assertEquals($session2->id, $class2->academic_session_id);
    }

    public function test_duplicate_class_name_in_same_session_is_rejected(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();

        SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'A',
            'name' => 'JSS 1A',
            'capacity' => 35,
            'is_active' => true,
        ]);

        // Attempt to create duplicate JSS 1A in same session
        $response = $this->actingAs($admin)->post('/academic/classes', [
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'A',
            'name' => 'JSS 1A',
        ]);

        $response->assertSessionHasErrors(['name']);
    }

    public function test_admin_can_update_class_arm_and_name(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();

        // Start as class without arm
        $class = SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => null,
            'name' => 'JSS 1',
            'capacity' => 35,
            'is_active' => true,
        ]);

        // Update to assign an arm
        $response = $this->actingAs($admin)->put("/academic/classes/{$class->id}", [
            'arm' => 'A',
            'name' => 'JSS 1A',
            'classroom' => 'Room 10',
            'capacity' => 45,
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('A', $class->fresh()->arm);
        $this->assertEquals('JSS 1A', $class->fresh()->name);
        $this->assertEquals(45, $class->fresh()->capacity);
    }

    // ── Subjects & Stage Mapping ───────────────────────────────────────────

    public function test_admin_can_create_subject_with_stage_mapping(): void
    {
        $admin = $this->createAdmin();
        $jss = EducationStage::where('code', 'JSS')->first();
        $sss = EducationStage::where('code', 'SSS')->first();

        $response = $this->actingAs($admin)->post('/academic/subjects', [
            'name' => 'Robotics & Artificial Intelligence',
            'code' => 'RAI',
            'description' => 'Modern computing and robotics curriculum',
            'stages' => [$jss->id, $sss->id],
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('subjects', [
            'name' => 'Robotics & Artificial Intelligence',
            'code' => 'RAI',
        ]);

        $subject = Subject::where('code', 'RAI')->first();
        $this->assertCount(2, $subject->stages);
    }

    public function test_cannot_delete_subject_with_assigned_classes(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();
        $subject = Subject::where('code', 'MTH')->first();

        $class = SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'B',
            'name' => 'JSS 1B',
            'capacity' => 35,
            'is_active' => true,
        ]);

        // Assign subject to class
        $class->subjects()->attach($subject->id, ['is_active' => true]);

        // Attempt deletion of subject
        $response = $this->actingAs($admin)->delete("/academic/subjects/{$subject->id}");
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('subjects', ['id' => $subject->id]);
    }

    // ── Class-Subject Assignments ──────────────────────────────────────────

    public function test_admin_can_assign_subject_to_class(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();
        $subject = Subject::where('code', 'MTH')->first();

        $class = SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'C',
            'name' => 'JSS 1C',
            'capacity' => 35,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post("/academic/classes/{$class->id}/subjects", [
            'subject_id' => $subject->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('class_subjects', [
            'class_id' => $class->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_cannot_assign_duplicate_subject_to_same_class(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();
        $subject = Subject::where('code', 'MTH')->first();

        $class = SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'D',
            'name' => 'JSS 1D',
            'capacity' => 35,
            'is_active' => true,
        ]);

        $class->subjects()->attach($subject->id, ['is_active' => true]);

        // Attempt duplicate assignment
        $response = $this->actingAs($admin)->post("/academic/classes/{$class->id}/subjects", [
            'subject_id' => $subject->id,
        ]);

        $response->assertSessionHasErrors(['subject_id']);
    }

    public function test_admin_can_bulk_sync_subjects_to_class(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();

        $mth = Subject::where('code', 'MTH')->first();
        $eng = Subject::where('code', 'ENG')->first();
        $sci = Subject::where('code', 'BSC')->first();

        $class = SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'Gold',
            'name' => 'JSS 1 Gold',
            'capacity' => 35,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->post("/academic/classes/{$class->id}/subjects/bulk-sync", [
            'subject_ids' => [$mth->id, $eng->id, $sci->id],
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals(3, $class->fresh()->subjects()->count());
    }

    public function test_admin_can_remove_subject_from_class(): void
    {
        $admin = $this->createAdmin();
        $session = AcademicSession::where('is_current', true)->first();
        $level = ClassLevel::where('code', 'JSS1')->first();
        $subject = Subject::where('code', 'MTH')->first();

        $class = SchoolClass::create([
            'academic_session_id' => $session->id,
            'class_level_id' => $level->id,
            'arm' => 'Silver',
            'name' => 'JSS 1 Silver',
            'capacity' => 35,
            'is_active' => true,
        ]);

        $class->subjects()->attach($subject->id, ['is_active' => true]);
        $this->assertDatabaseHas('class_subjects', ['class_id' => $class->id, 'subject_id' => $subject->id]);

        $response = $this->actingAs($admin)->delete("/academic/classes/{$class->id}/subjects/{$subject->id}");
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('class_subjects', ['class_id' => $class->id, 'subject_id' => $subject->id]);
    }

    // ── Authorization & RBAC ───────────────────────────────────────────────

    public function test_unauthorized_user_cannot_access_academic_configuration(): void
    {
        $plainUser = $this->createPlainUser();

        // Plain user without roles/permissions cannot access academic views
        $this->actingAs($plainUser)->get('/academic/sessions')->assertForbidden();
        $this->actingAs($plainUser)->get('/academic/structure')->assertForbidden();
        $this->actingAs($plainUser)->get('/academic/classes')->assertForbidden();
        $this->actingAs($plainUser)->get('/academic/subjects')->assertForbidden();

        // Plain user cannot create academic sessions
        $this->actingAs($plainUser)->post('/academic/sessions', [
            'name' => 'Hack Session',
            'start_date' => '2026-09-01',
            'end_date' => '2027-07-31',
            'status' => 'Active',
        ])->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/academic/sessions')->assertRedirect('/login');
        $this->get('/academic/classes')->assertRedirect('/login');
        $this->get('/academic/subjects')->assertRedirect('/login');
    }
}
