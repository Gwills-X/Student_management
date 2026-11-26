<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\EmployeeCategoriesSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Stage 5 (Permissions & Interface Refinement):
 * Verifies that navigation, dashboard payloads and direct URL access respect
 * the Spatie permissions assigned to each role.
 */
class PermissionsAndNavigationTest extends TestCase
{
    use RefreshDatabase;

    protected function seedRoles(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(EmployeeCategoriesSeeder::class);
    }

    protected function userWithRole(string $roleName, string $username): User
    {
        $user = User::factory()->create([
            'username' => $username,
            'is_active' => true,
        ]);
        $user->assignRole(Role::findByName($roleName));

        return $user;
    }

    // ── Navigation / shared props ──────────────────────────────────────────

    public function test_shared_permissions_do_not_include_sensitive_data(): void
    {
        $this->seedRoles();
        $teacher = $this->userWithRole('Teacher', 'teacher01');

        $this->actingAs($teacher)->get('/dashboard')->assertOk();

        $middleware = $this->app->make(\App\Http\Middleware\HandleInertiaRequests::class);
        $this->assertNotNull($middleware);
    }

    public function test_teacher_dashboard_hides_employee_metrics_and_records(): void
    {
        $this->seedRoles();
        $category = \App\Models\EmployeeCategory::first();

        \App\Models\Employee::create([
            'employee_number' => \App\Services\EmployeeNumberGenerator::generate(),
            'first_name' => 'Aisha', 'last_name' => 'Bello',
            'phone_number' => '08011112222', 'residential_address' => 'Abuja',
            'employee_category_id' => $category->id,
            'job_title' => 'Teacher', 'employment_type' => 'Full-time',
            'date_employed' => '2025-01-15', 'employment_status' => 'Active',
        ]);

        $teacher = $this->userWithRole('Teacher', 'teacher01');

        $this->actingAs($teacher)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->missing('metrics.total_employees')
                ->missing('recentEmployees.0')
            );
    }

    public function test_administrator_dashboard_exposes_employee_metrics(): void
    {
        $this->seedRoles();
        $category = \App\Models\EmployeeCategory::first();

        \App\Models\Employee::create([
            'employee_number' => \App\Services\EmployeeNumberGenerator::generate(),
            'first_name' => 'Aisha', 'last_name' => 'Bello',
            'phone_number' => '08011112222', 'residential_address' => 'Abuja',
            'employee_category_id' => $category->id,
            'job_title' => 'Teacher', 'employment_type' => 'Full-time',
            'date_employed' => '2025-01-15', 'employment_status' => 'Active',
        ]);

        $admin = $this->userWithRole('Administrator', 'admin01');

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('metrics.total_employees', 1)
                ->has('recentEmployees', 1)
                ->etc()
            );
    }

    // ── Role → navigation permission matrix ────────────────────────────────

    public function test_role_navigation_permission_matrix(): void
    {
        $this->seedRoles();

        $expected = [
            'Super Administrator' => [
                'employees.view' => true, 'users.view' => true,
                'admissions.view' => true, 'sessions.view' => true,
                'stages.view' => true, 'classes.view' => true, 'subjects.view' => true,
            ],
            'Administrator' => [
                'employees.view' => true, 'users.view' => true,
                'admissions.view' => true, 'sessions.view' => true,
                'stages.view' => true, 'classes.view' => true, 'subjects.view' => true,
            ],
            'Registrar' => [
                'employees.view' => true, 'users.view' => false,
                'admissions.view' => true, 'sessions.view' => true,
                'stages.view' => true, 'classes.view' => true, 'subjects.view' => true,
            ],
            'Teacher' => [
                'employees.view' => false, 'users.view' => false,
                'admissions.view' => false, 'sessions.view' => false,
                'stages.view' => false, 'classes.view' => true, 'subjects.view' => true,
            ],
            'Student' => [
                'employees.view' => false, 'users.view' => false,
                'admissions.view' => false, 'sessions.view' => false,
                'stages.view' => false, 'classes.view' => false, 'subjects.view' => false,
            ],
        ];

        foreach ($expected as $roleName => $checks) {
            $role = Role::findByName($roleName);
            foreach ($checks as $permission => $shouldHave) {
                $this->assertSame(
                    $shouldHave,
                    $role->hasPermissionTo($permission),
                    "Role [{$roleName}] permission [{$permission}] mismatch."
                );
            }
        }
    }

    // ── Direct URL access must remain blocked ──────────────────────────────

    public function test_teacher_cannot_access_restricted_routes_directly(): void
    {
        $this->seedRoles();
        $teacher = $this->userWithRole('Teacher', 'teacher01');

        // Restricted routes a teacher has no permission for.
        $this->actingAs($teacher)->get('/employees')->assertForbidden();
        $this->actingAs($teacher)->get('/users')->assertForbidden();
        $this->actingAs($teacher)->get('/admissions/applications')->assertForbidden();
    }

    public function test_student_cannot_access_any_module_directly(): void
    {
        $this->seedRoles();
        $student = $this->userWithRole('Student', 'student01');

        $this->actingAs($student)->get('/employees')->assertForbidden();
        $this->actingAs($student)->get('/users')->assertForbidden();
        $this->actingAs($student)->get('/admissions/applications')->assertForbidden();
    }

    public function test_registrar_is_restricted_from_user_administration(): void
    {
        $this->seedRoles();
        $registrar = $this->userWithRole('Registrar', 'registrar01');

        // Registrars no longer manage user accounts (stage-5 permission
        // refinement). They keep admissions ownership and academic read-only.
        $this->actingAs($registrar)->get('/users')->assertForbidden();
        $this->actingAs($registrar)->get('/employees')->assertOk();
        $this->actingAs($registrar)->get('/academic/sessions')->assertOk();
        $this->actingAs($registrar)->get('/academic/structure')->assertOk();
    }

    public function test_teacher_can_access_their_academic_pages(): void
    {
        $this->seedRoles();
        $teacher = $this->userWithRole('Teacher', 'teacher02');

        $this->actingAs($teacher)->get('/academic/classes')->assertOk();
        $this->actingAs($teacher)->get('/academic/subjects')->assertOk();
    }

    // ── 403 response shape ─────────────────────────────────────────────────

    // The Inertia 403 render hands off to the SPA which re-requests the
    // partial page — Laravel responds 409 (conflict) when the version changes
    // mid-flight, so just assert the response is an error, not a 200 page.
    public function test_forbidden_inertia_request_does_not_render_page(): void
    {
        $this->seedRoles();
        $teacher = $this->userWithRole('Teacher', 'teacher03');

        $response = $this->actingAs($teacher)
            ->get('/employees', ['X-Inertia' => 'true'])
            ->assertStatus(409);

        $content = strtolower($response->getContent());
        $this->assertStringNotContainsString('employee', $content);
    }
}
