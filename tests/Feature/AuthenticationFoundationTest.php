<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_public_and_registration_is_not_available(): void
    {
        $this->get('/login')->assertOk();
        $this->get('/register')->assertNotFound();
        $this->post('/register')->assertNotFound();
    }

    public function test_active_user_can_login_with_username(): void
    {
        $user = User::factory()->create([
            'username' => 'teacher01',
            'password' => 'Password123!',
            'is_active' => true,
        ]);

        $this->post('/login', [
            'username' => 'teacher01',
            'password' => 'Password123!',
        ])
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'username' => 'inactive01',
            'password' => 'Password123!',
            'is_active' => false,
        ]);

        $this->post('/login', [
            'username' => 'inactive01',
            'password' => 'Password123!',
        ])
            ->assertRedirect()
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $this->post('/login', [
            'username' => 'missing-user',
            'password' => 'incorrect-password',
        ])
            ->assertRedirect()
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_dashboard_and_logout(): void
    {
        $user = User::factory()->create([
            'username' => 'principal01',
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->where('user.username', 'principal01')
            );

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect('/login');

        $this->assertGuest();
    }

    public function test_initial_roles_are_seeded_without_excessive_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->assertDatabaseHas('roles', ['name' => 'Super Administrator']);
        $this->assertDatabaseHas('roles', ['name' => 'Administrator']);
        $this->assertDatabaseHas('roles', ['name' => 'Principal']);
        $this->assertDatabaseHas('roles', ['name' => 'Registrar']);
        $this->assertDatabaseHas('roles', ['name' => 'Teacher']);
        $this->assertDatabaseHas('roles', ['name' => 'Form Master']);
        $this->assertDatabaseHas('roles', ['name' => 'Assistant Form Master']);
        $this->assertDatabaseHas('roles', ['name' => 'Student']);

        $student = \Spatie\Permission\Models\Role::findByName('Student');
        $this->assertCount(0, $student->permissions);

        $administrator = \Spatie\Permission\Models\Role::findByName('Administrator');
        $this->assertTrue($administrator->hasPermissionTo('users.view'));
        $this->assertFalse($administrator->hasPermissionTo('users.delete'));
    }
}
