<?php

namespace App\Providers;

use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use App\Models\AdmissionApplication;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\Employee;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use App\Policies\AcademicSessionPolicy;
use App\Policies\AcademicTermPolicy;
use App\Policies\AdmissionApplicationPolicy;
use App\Policies\ClassLevelPolicy;
use App\Policies\EducationStagePolicy;
use App\Policies\EmployeePolicy;
use App\Policies\SchoolClassPolicy;
use App\Policies\StudentPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\UserPolicy;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Keep the permission cache in sync with freshly re-seeded roles.
        // Without this, Spatie's cached permission map keeps serving stale
        // role definitions even after RolesAndPermissionsSeeder re-runs.
        Artisan::command('roles:resync', function () {
            $this->call(RolesAndPermissionsSeeder::class);
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            $this->info('Role permissions re-synced and permission cache flushed.');
        });
        // Explicit policy mappings
        Gate::policy(Employee::class, EmployeePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(AcademicSession::class, AcademicSessionPolicy::class);
        Gate::policy(AcademicTerm::class, AcademicTermPolicy::class);
        Gate::policy(EducationStage::class, EducationStagePolicy::class);
        Gate::policy(ClassLevel::class, ClassLevelPolicy::class);
        Gate::policy(SchoolClass::class, SchoolClassPolicy::class);
        Gate::policy(Subject::class, SubjectPolicy::class);
        Gate::policy(AdmissionApplication::class, AdmissionApplicationPolicy::class);
        Gate::policy(Student::class, StudentPolicy::class);

        // Super Administrator bypass for all gate checks
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Administrator') ? true : null;
        });

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        /**
         * Register a custom Eloquent user provider that authenticates
         * by `username` instead of the default `email` field.
         */
        Auth::provider('username_eloquent', function ($app, array $config) {
            return new UsernameUserProvider(
                $app['hash'],
                $config['model']
            );
        });
    }
}
