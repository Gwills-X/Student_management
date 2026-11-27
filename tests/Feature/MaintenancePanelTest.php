<?php

namespace Tests\Feature;

use App\Models\MaintenanceLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Security & behaviour tests for the restricted maintenance panel.
 */
class MaintenancePanelTest extends TestCase
{
    use RefreshDatabase;

    private string $password = 'secret-deployment-pass';

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        config([
            'maintenance.enabled'       => true,
            'maintenance.password_hash' => Hash::make($this->password),
            'maintenance.seeders'       => [
                'roles-and-permissions' => [
                    'class'       => \Database\Seeders\RolesAndPermissionsSeeder::class,
                    'description' => 'Roles.',
                ],
            ],
        ]);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function superAdmin(string $username = 'rootadmin'): User
    {
        $user = User::factory()->create(['username' => $username, 'is_active' => true]);
        $user->assignRole(Role::findByName('Super Administrator'));

        return $user;
    }

    private function regularUser(): User
    {
        $user = User::factory()->create(['username' => 'teacher01', 'is_active' => true]);
        $user->assignRole(Role::findByName('Teacher'));

        return $user;
    }

    private function unlocked(User $user): self
    {
        $this->actingAs($user)
            ->post(route('maintenance.reauth.attempt'), ['password' => $this->password]);

        return $this;
    }

    // ── Access control ──────────────────────────────────────────────────────

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('maintenance.dashboard'))->assertRedirect(route('login'));
    }

    public function test_non_super_admins_are_denied(): void
    {
        $this->actingAs($this->regularUser())
            ->get(route('maintenance.dashboard'))
            ->assertForbidden();
    }

    public function test_super_admin_without_password_config_is_denied_in_production(): void
    {
        config(['maintenance.password_hash' => null]);
        config(['app.env' => 'production']);

        $this->actingAs($this->superAdmin())
            ->get(route('maintenance.dashboard'))
            ->assertForbidden();
    }

    public function test_disabled_panel_denies_everyone(): void
    {
        config(['maintenance.enabled' => false]);

        $this->actingAs($this->superAdmin())
            ->get(route('maintenance.dashboard'))
            ->assertForbidden();
    }

    public function test_super_admin_with_configuration_can_view_dashboard(): void
    {
        $this->actingAs($this->superAdmin())
            ->get(route('maintenance.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Maintenance/Index'));
    }

    // ── Re-authentication ───────────────────────────────────────────────────

    public function test_mutations_require_reauthentication(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->post(route('maintenance.migrations.run'))
            ->assertRedirect()
            ->assertSessionHas('error', function ($msg) {
                return str_contains($msg, 'Re-authentication required');
            });
    }

    public function test_invalid_password_is_rejected_and_logged(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->post(route('maintenance.reauth.attempt'), ['password' => 'wrong-password'])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('maintenance_logs', [
            'action'  => 'reauth.failed',
            'success' => false,
        ]);
    }

    public function test_valid_password_grants_reauth(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->post(route('maintenance.reauth.attempt'), ['password' => $this->password])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertTrue(app(\App\Services\Maintenance\MaintenanceService::class)->reauthValid());
    }

    public function test_password_is_never_stored_or_logged(): void
    {
        $admin = $this->superAdmin();

        $this->unlocked($admin);

        $this->assertDatabaseMissing('maintenance_logs', ['output' => $this->password]);
        $this->assertDatabaseMissing('maintenance_logs', ['target' => $this->password]);

        // And the hash is not a plain-text copy of the password
        $this->assertNotSame($this->password, config('maintenance.password_hash'));
    }

    // ── POST-only mutations (GET = confirmation page, POST = execute) ────

    public function test_get_to_run_urls_renders_confirmation_without_executing(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        // GET on each run URL is a confirmation page — no operation runs.
        $this->actingAs($admin)
            ->get(route('maintenance.migrations.run'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/ConfirmOperation')
                ->where('operation.kind', 'migrations.run'));

        $this->actingAs($admin)
            ->get(route('maintenance.storage.link'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/ConfirmOperation')
                ->where('operation.kind', 'storage.link'));

        $this->actingAs($admin)
            ->get(route('maintenance.cache.clear', ['cache' => 'cache']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/ConfirmOperation')
                ->where('operation.kind', 'cache.clear')
                ->where('operation.payload.key', 'cache'));

        $this->actingAs($admin)
            ->get(route('maintenance.optimization.run', ['command' => 'optimize']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/ConfirmOperation'));

        // GET must not audit any operation execution.
        $this->assertSame(
            0,
            MaintenanceLog::whereIn('action', [
                'migrations.run', 'cache.clear', 'cache.rebuild',
                'storage.link', 'optimization.run', 'seeders.run',
            ])->count()
        );
    }

    public function test_unknown_slug_on_get_confirmation_is_rejected(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->get(route('maintenance.seeders.run', ['seeder' => 'Database\\Seeders\\DatabaseSeeder']))
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown or unapproved seeder.');

        $this->actingAs($admin)
            ->get(route('maintenance.cache.clear', ['cache' => 'boom']))
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown cache clear action.');

        $this->actingAs($admin)
            ->get(route('maintenance.cache.rebuild', ['cache' => 'boom']))
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown cache rebuild action.');

        $this->actingAs($admin)
            ->get(route('maintenance.optimization.run', ['command' => 'exec-shell']))
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown optimization action.');
    }

    public function test_seeder_confirmation_shows_approved_slug_only(): void
    {
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->get(route('maintenance.seeders.run', ['seeder' => 'roles-and-permissions']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Maintenance/ConfirmOperation')
                ->where('operation.kind', 'seeders.run')
                ->where('operation.payload.slug', 'roles-and-permissions')
                ->where('operation.danger', true));
    }

    public function test_post_executes_only_approved_operations(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        // Approved cache clear via POST works...
        $this->actingAs($admin)
            ->post(route('maintenance.cache.clear'), ['key' => 'cache'])
            ->assertRedirect()
            ->assertSessionHas('success');

        // ...but a non-allowlisted key never executes.
        $this->actingAs($admin)
            ->post(route('maintenance.cache.clear'), ['key' => 'migrate:fresh'])
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown cache action.');

        $this->actingAs($admin)
            ->post(route('maintenance.optimization.run'), ['key' => 'not-a-command'])
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown optimization action.');
    }

    // ── Seeder allowlist ───────────────────────────────────────────────────

    public function test_unknown_seeder_slug_is_rejected(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        $this->actingAs($admin)
            ->post(route('maintenance.seeders.run'), ['slug' => '\App\Models\User'])
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown or unapproved seeder.');
    }

    public function test_arbitrary_class_names_are_never_accepted(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        foreach ([
            ['slug' => 'Database\\Seeders\\DatabaseSeeder'],
            ['slug' => '../../etc/passwd'],
            ['class' => 'Database\\Seeders\\DatabaseSeeder'],
            ['slug' => 'drop-tables'],
        ] as $payload) {
            $this->actingAs($admin)
                ->post(route('maintenance.seeders.run'), $payload)
                ->assertRedirect()
                ->assertSessionHas('error');
        }

        // Each rejected attempt is audited, but nothing dangerous was executed:
        // no log entry records a successful execution of a non-allowlisted class.
        $this->assertTrue(
            MaintenanceLog::where('action', 'seeders.run')->where('success', true)->doesntExist()
        );
    }

    public function test_approved_seeder_runs_successfully(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        $this->actingAs($admin)
            ->post(route('maintenance.seeders.run'), ['slug' => 'roles-and-permissions'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $log = MaintenanceLog::where('action', 'seeders.run')->latest()->first();
        $this->assertNotNull($log);
        $this->assertTrue((bool) $log->success);
        $this->assertSame('roles-and-permissions', $log->target);
    }

    // ── Cache allowlist ────────────────────────────────────────────────────

    public function test_unknown_cache_key_is_rejected(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        $this->actingAs($admin)
            ->post(route('maintenance.cache.clear'), ['key' => 'rm -rf /'])
            ->assertRedirect()
            ->assertSessionHas('error', 'Unknown cache action.');
    }

    public function test_allowlisted_cache_clear_runs(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        $this->actingAs($admin)
            ->post(route('maintenance.cache.clear'), ['key' => 'cache'])
            ->assertRedirect()
            ->assertSessionHas('success', function ($msg) {
                return str_contains($msg, 'Application cache');
            });
    }

    // ── Audit log ──────────────────────────────────────────────────────────

    public function test_operations_are_audited_with_user_and_target(): void
    {
        $admin = $this->superAdmin();
        $this->unlocked($admin);

        $this->actingAs($admin)->post(route('maintenance.cache.clear'), ['key' => 'view']);

        $log = MaintenanceLog::where('action', 'cache.clear')->latest()->first();
        $this->assertNotNull($log);
        $this->assertSame($admin->id, $log->user_id);
        $this->assertSame($admin->username, $log->username);
        $this->assertSame('view', $log->target);
        $this->assertTrue((bool) $log->success);
    }

    public function test_history_page_requires_maintenance_access(): void
    {
        $this->actingAs($this->regularUser())
            ->get(route('maintenance.history'))
            ->assertForbidden();

        $this->actingAs($this->superAdmin())
            ->get(route('maintenance.history'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Maintenance/History'));
    }

    // ── Rate limiting ──────────────────────────────────────────────────────

    public function test_maintenance_routes_are_rate_limited(): void
    {
        config(['maintenance.rate_limit' => 3]);

        $admin = $this->superAdmin();

        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($admin)->get(route('maintenance.dashboard'))->assertOk();
        }

        $this->actingAs($admin)->get(route('maintenance.dashboard'))->assertStatus(429);
    }
}
