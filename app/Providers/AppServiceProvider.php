<?php

namespace App\Providers;

use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\Employee;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use App\Policies\AcademicSessionPolicy;
use App\Policies\AcademicTermPolicy;
use App\Policies\ClassLevelPolicy;
use App\Policies\EducationStagePolicy;
use App\Policies\EmployeePolicy;
use App\Policies\SchoolClassPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Auth;
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
        // Explicit policy mappings
        Gate::policy(Employee::class, EmployeePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(AcademicSession::class, AcademicSessionPolicy::class);
        Gate::policy(AcademicTerm::class, AcademicTermPolicy::class);
        Gate::policy(EducationStage::class, EducationStagePolicy::class);
        Gate::policy(ClassLevel::class, ClassLevelPolicy::class);
        Gate::policy(SchoolClass::class, SchoolClassPolicy::class);
        Gate::policy(Subject::class, SubjectPolicy::class);

        // Super Administrator bypass for all gate checks
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Administrator') ? true : null;
        });

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
