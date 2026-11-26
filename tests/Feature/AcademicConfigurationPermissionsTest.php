<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\User;
use Database\Seeders\AcademicStructureSeeder;
use Database\Seeders\EmployeeCategoriesSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Verifies that academic configuration permissions are enforced at the
 * backend for every create / edit / delete operation, per role:
 *  - Teacher, Form Master, Assistant Form Master and Registrar must be
 *    rejected on every academic configuration write.
 *  - Administrator must be able to create academic configuration.
 *  - Super Administrator retains full access.
 */
class AcademicConfigurationPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(EmployeeCategoriesSeeder::class);
        $this->seed(AcademicStructureSeeder::class);
    }

    protected function userWithRole(string $roleName): User
    {
        $user = User::factory()->create([
            'username' => strtolower(str_replace(' ', '', $roleName)).'_'.uniqid(),
            'is_active' => true,
        ]);
        $user->assignRole(Role::findByName($roleName));

        return $user;
    }

    protected function validSessionData(): array
    {
        return [
            'name' => 'Sess-'.uniqid(),
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'active',
        ];
    }

    protected function validStageData(): array
    {
        return [
            'name' => 'Stage-'.uniqid(),
            'code' => 'ST'.rand(100, 999),
            'display_order' => 99,
        ];
    }

    protected function validLevelData($stageId = 1): array
    {
        return [
            'name' => 'Level-'.uniqid(),
            'code' => 'LV'.rand(100, 999),
            'education_stage_id' => $stageId,
            'progression_order' => 99,
        ];
    }

    protected function validClassData(): array
    {
        return [
            'class_level_id' => 1,
            'academic_session_id' => 1,
            'arm' => 'A',
        ];
    }

    protected function validSubjectData(): array
    {
        return [
            'name' => 'Sub-'.uniqid(),
            'code' => 'SB'.rand(100, 999),
            'stages' => [1],
        ];
    }

    // ── Role permission matrix ─────────────────────────────────────────────

    public function test_teacher_form_master_and_assistant_have_no_configuration_permissions(): void
    {
        foreach (['Teacher', 'Form Master', 'Assistant Form Master'] as $roleName) {
            $role = Role::findByName($roleName);

            foreach ([
                'academic.view',
                'sessions.create', 'sessions.edit', 'sessions.activate', 'sessions.delete',
                'terms.create', 'terms.edit', 'terms.activate', 'terms.delete',
                'stages.manage',
                'class_levels.manage',
                'classes.create', 'classes.edit', 'classes.delete',
                'subjects.create', 'subjects.edit', 'subjects.delete',
                'class_subjects.manage',
            ] as $permission) {
                $this->assertFalse(
                    $role->hasPermissionTo($permission),
                    "Role [{$roleName}] must NOT have permission [{$permission}]."
                );
            }

            // Teachers retain read-only access to classes & subjects.
            $this->assertTrue($role->hasPermissionTo('classes.view'));
            $this->assertTrue($role->hasPermissionTo('subjects.view'));
        }
    }

    public function test_registrar_has_no_academic_configuration_permissions(): void
    {
        $role = Role::findByName('Registrar');

        foreach ([
            'sessions.create', 'sessions.edit', 'sessions.activate', 'sessions.delete',
            'terms.create', 'terms.edit', 'terms.activate', 'terms.delete',
            'stages.manage',
            'class_levels.manage',
            'classes.create', 'classes.edit', 'classes.delete',
            'subjects.create', 'subjects.edit', 'subjects.delete',
            'class_subjects.manage',
        ] as $permission) {
            $this->assertFalse(
                $role->hasPermissionTo($permission),
                "Registrar must NOT have permission [{$permission}]."
            );
        }

        // Registrar retains admission ownership.
        $this->assertTrue($role->hasPermissionTo('admissions.create'));
        $this->assertTrue($role->hasPermissionTo('admissions.approve'));
    }

    // ── Teacher blocked from academic configuration writes ─────────────────

    public function test_teacher_cannot_create_academic_session(): void
    {
        $teacher = $this->userWithRole('Teacher');

        $this->actingAs($teacher)
            ->post('/academic/sessions', $this->validSessionData())
            ->assertForbidden();

        $this->assertDatabaseMissing('academic_sessions', [
            'start_date' => '2026-01-01',
        ]);
    }

    public function test_teacher_cannot_update_or_delete_academic_session(): void
    {
        $teacher = $this->userWithRole('Teacher');
        $session = AcademicSession::create([
            'name' => 'Existing Session',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => 'completed',
        ]);

        $this->actingAs($teacher)
            ->put("/academic/sessions/{$session->id}", array_merge($this->validSessionData(), ['name' => 'Hacked']))
            ->assertForbidden();

        $this->actingAs($teacher)
            ->delete("/academic/sessions/{$session->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('academic_sessions', ['id' => $session->id, 'name' => 'Existing Session']);
    }

    public function test_teacher_cannot_create_term_stage_level_class_or_subject(): void
    {
        $teacher = $this->userWithRole('Teacher');

        $this->actingAs($teacher)
            ->post('/academic/sessions/1/terms', [
                'name' => 'First Term',
                'term_order' => 4,
                'start_date' => '2026-01-01',
                'end_date' => '2026-04-30',
                'status' => 'active',
            ])->assertForbidden();

        $this->actingAs($teacher)->post('/academic/stages', $this->validStageData())->assertForbidden();
        $this->actingAs($teacher)->post('/academic/levels', $this->validLevelData())->assertForbidden();
        $this->actingAs($teacher)->post('/academic/classes', $this->validClassData())->assertForbidden();
        $this->actingAs($teacher)->post('/academic/subjects', $this->validSubjectData())->assertForbidden();

        $this->assertDatabaseMissing('academic_terms', ['term_order' => 4]);
        $this->assertDatabaseMissing('education_stages', ['display_order' => 99]);
        $this->assertDatabaseMissing('class_levels', ['progression_order' => 99]);
        $this->assertDatabaseCount('classes', 0);
        $this->assertDatabaseMissing('subjects', ['code' => $this->validSubjectData()['code']]);
    }

    public function test_teacher_cannot_access_academic_configuration_pages(): void
    {
        $teacher = $this->userWithRole('Teacher');

        $this->actingAs($teacher)->get('/academic/sessions')->assertForbidden();
        $this->actingAs($teacher)->get('/academic/structure')->assertForbidden();
        $this->actingAs($teacher)->get('/academic/sessions/1')->assertForbidden();
        $this->actingAs($teacher)->get('/academic/classes/create')->assertForbidden();

        // Teacher retains read access to the class & subject catalogs.
        $this->actingAs($teacher)->get('/academic/classes')->assertOk();
        $this->actingAs($teacher)->get('/academic/subjects')->assertOk();
    }

    public function test_form_master_cannot_create_academic_configuration(): void
    {
        $formMaster = $this->userWithRole('Form Master');

        $this->actingAs($formMaster)->post('/academic/sessions', $this->validSessionData())->assertForbidden();
        $this->actingAs($formMaster)->post('/academic/stages', $this->validStageData())->assertForbidden();
        $this->actingAs($formMaster)->post('/academic/levels', $this->validLevelData())->assertForbidden();
        $this->actingAs($formMaster)->post('/academic/classes', $this->validClassData())->assertForbidden();
        $this->actingAs($formMaster)->post('/academic/subjects', $this->validSubjectData())->assertForbidden();
    }

    public function test_assistant_form_master_cannot_create_academic_configuration(): void
    {
        $assistant = $this->userWithRole('Assistant Form Master');

        $this->actingAs($assistant)->post('/academic/sessions', $this->validSessionData())->assertForbidden();
        $this->actingAs($assistant)->post('/academic/stages', $this->validStageData())->assertForbidden();
        $this->actingAs($assistant)->post('/academic/levels', $this->validLevelData())->assertForbidden();
        $this->actingAs($assistant)->post('/academic/classes', $this->validClassData())->assertForbidden();
        $this->actingAs($assistant)->post('/academic/subjects', $this->validSubjectData())->assertForbidden();
    }

    public function test_registrar_cannot_create_academic_configuration(): void
    {
        $registrar = $this->userWithRole('Registrar');

        $this->actingAs($registrar)->post('/academic/sessions', $this->validSessionData())->assertForbidden();
        $this->actingAs($registrar)->post('/academic/stages', $this->validStageData())->assertForbidden();
        $this->actingAs($registrar)->post('/academic/levels', $this->validLevelData())->assertForbidden();
        $this->actingAs($registrar)->post('/academic/classes', $this->validClassData())->assertForbidden();
        $this->actingAs($registrar)->post('/academic/subjects', $this->validSubjectData())->assertForbidden();
    }

    public function test_registrar_cannot_manage_user_accounts(): void
    {
        $registrar = $this->userWithRole('Registrar');

        $this->actingAs($registrar)->get('/users')->assertForbidden();
        $this->actingAs($registrar)->post('/users', [
            'name' => 'Test User',
            'username' => 'testuser'.rand(1000, 9999),
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'Teacher',
        ])->assertForbidden();
    }

    // ── Administrator CAN perform academic configuration ───────────────────

    public function test_administrator_can_create_academic_configuration(): void
    {
        $admin = $this->userWithRole('Administrator');

        $sessionData = $this->validSessionData();
        $this->actingAs($admin)->post('/academic/sessions', $sessionData)->assertRedirect();

        $this->assertDatabaseHas('academic_sessions', ['name' => $sessionData['name']]);
    }

    public function test_administrator_can_create_stage_level_class_and_subject(): void
    {
        $admin = $this->userWithRole('Administrator');

        $stageData = $this->validStageData();
        $this->actingAs($admin)->post('/academic/stages', $stageData)->assertRedirect();

        $stage = \App\Models\EducationStage::where('code', $stageData['code'])->first();

        $levelData = $this->validLevelData($stage->id);
        $this->actingAs($admin)->post('/academic/levels', $levelData)->assertRedirect();

        $session = AcademicSession::create([
            'name' => 'Sess-'.uniqid(),
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'status' => 'active',
        ]);

        $classLevelId = \App\Models\ClassLevel::where('education_stage_id', $stage->id)->first()
            ? \App\Models\ClassLevel::where('education_stage_id', $stage->id)->first()->id
            : \App\Models\ClassLevel::first()->id;

        $classData = [
            'class_level_id' => $classLevelId,
            'academic_session_id' => $session->id,
            'arm' => 'A',
        ];
        $this->actingAs($admin)->post('/academic/classes', $classData)->assertRedirect();

        $subjectData = $this->validSubjectData();
        $this->actingAs($admin)->post('/academic/subjects', $subjectData);

        $this->assertDatabaseHas('education_stages', ['code' => $stageData['code']]);
        $this->assertDatabaseHas('class_levels', ['name' => $levelData['name']]);
        $this->assertDatabaseHas('classes', ['academic_session_id' => $session->id]);
        $this->assertDatabaseHas('subjects', ['code' => $subjectData['code']]);
    }

    // ── Super Administrator retains full access ────────────────────────────

    public function test_super_administrator_retains_full_access(): void
    {
        $super = $this->userWithRole('Super Administrator');

        $sessionData = $this->validSessionData();
        $this->actingAs($super)->post('/academic/sessions', $sessionData)->assertRedirect();
        $this->assertDatabaseHas('academic_sessions', ['name' => $sessionData['name']]);

        $this->actingAs($super)->post('/academic/stages', $this->validStageData())->assertRedirect();
        $this->actingAs($super)->post('/academic/subjects', $this->validSubjectData())->assertRedirect();
    }

    // ── Custom roles only receive explicitly assigned permissions ──────────

    public function test_custom_role_has_only_explicitly_assigned_permissions(): void
    {
        $custom = Role::create(['name' => 'Custom Viewer', 'guard_name' => 'web']);
        $custom->syncPermissions(['classes.view']);

        $user = User::factory()->create(['username' => 'custom_'.uniqid(), 'is_active' => true]);
        $user->assignRole($custom);

        $this->assertTrue($user->hasPermissionTo('classes.view'));
        $this->assertFalse($user->hasPermissionTo('classes.create'));
        $this->assertFalse($user->hasPermissionTo('sessions.create'));
        $this->assertFalse($user->hasPermissionTo('users.view'));
        $this->assertFalse($user->hasPermissionTo('admissions.view'));
    }
}
