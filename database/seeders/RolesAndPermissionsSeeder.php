<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Seeds roles and permissions for Stage 1, Stage 2, and Stage 3.
 */
class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ── All System Permissions ──────────────────────────────────────────
        $permissions = [
            // Stage 1: Foundational / Auth
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.activate',
            'users.reset_password',
            'roles.view',
            'roles.assign',
            'settings.view',
            'settings.edit',

            // Stage 2: Employee Management
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.status',
            'employees.documents',
            'employees.delete',

            // Stage 3: Academic Structure & Configuration
            'academic.view',
            'sessions.view',
            'sessions.create',
            'sessions.edit',
            'sessions.activate',
            'sessions.delete',

            'terms.view',
            'terms.create',
            'terms.edit',
            'terms.activate',
            'terms.delete',

            'stages.view',
            'stages.manage',

            'class_levels.view',
            'class_levels.manage',

            'classes.view',
            'classes.create',
            'classes.edit',
            'classes.delete',

            'subjects.view',
            'subjects.create',
            'subjects.edit',
            'subjects.delete',

            'class_subjects.manage',

            // Stage 4: Admission Management
            'admissions.view',
            'admissions.create',
            'admissions.edit',
            'admissions.review',
            'admissions.assess',
            'admissions.approve',
            'admissions.reject',
            'admissions.withdraw',
            'admissions.convert',
            'admissions.manage_documents',

            // Stage 5: Student Management & Enrolment
            'students.view',
            'students.view_all',
            'students.edit',
            'students.view_documents',
            'students.manage_documents',
            'students.view_history',
            'students.change_status',
            'students.enrol',
            'students.transfer',
            'students.progress',
            'students.view_class_lists',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // ── Roles ──────────────────────────────────────────────────────────
        $roles = [
            'Super Administrator',
            'Administrator',
            'Principal',
            'Registrar',
            'Teacher',
            'Form Master',
            'Assistant Form Master',
            'Student',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // ── Role Permissions Assignment ────────────────────────────────────
        // Super Administrator gets all permissions
        Role::findByName('Super Administrator')->syncPermissions(Permission::all());

        // Administrator gets operational & academic management permissions
        Role::findByName('Administrator')->syncPermissions([
            // User & employee management
            'users.view',
            'users.create',
            'users.edit',
            'users.activate',
            'users.reset_password',
            'roles.view',
            'roles.assign',
            'settings.view',
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.status',
            'employees.documents',

            // Academic structure
            'academic.view',
            'sessions.view',
            'sessions.create',
            'sessions.edit',
            'sessions.activate',
            'sessions.delete',
            'terms.view',
            'terms.create',
            'terms.edit',
            'terms.activate',
            'terms.delete',
            'stages.view',
            'stages.manage',
            'class_levels.view',
            'class_levels.manage',
            'classes.view',
            'classes.create',
            'classes.edit',
            'classes.delete',
            'subjects.view',
            'subjects.create',
            'subjects.edit',
            'subjects.delete',
            'class_subjects.manage',
            'admissions.view',
            'admissions.create',
            'admissions.edit',
            'admissions.review',
            'admissions.assess',
            'admissions.approve',
            'admissions.reject',
            'admissions.withdraw',
            'admissions.convert',
            'admissions.manage_documents',

            // Stage 5: student management & enrolment
            'students.view',
            'students.view_all',
            'students.edit',
            'students.view_documents',
            'students.manage_documents',
            'students.view_history',
            'students.change_status',
            'students.enrol',
            'students.transfer',
            'students.progress',
            'students.view_class_lists',
        ]);

        // Principal: oversight permissions
        Role::findByName('Principal')->syncPermissions([
            'users.view',
            'roles.view',
            'settings.view',
            'employees.view',
            'employees.documents',
            'academic.view',
            'sessions.view',
            'terms.view',
            'stages.view',
            'class_levels.view',
            'classes.view',
            'subjects.view',
        ]);

        // Principal: supervisory / reporting access only.
        // Read-only views across modules; NO configuration or management rights.
        Role::findByName('Principal')->syncPermissions([
            'users.view',
            'roles.view',
            'settings.view',
            'employees.view',
            'employees.documents',
            'academic.view',
            'sessions.view',
            'terms.view',
            'stages.view',
            'class_levels.view',
            'classes.view',
            'subjects.view',
            'admissions.view',
            'students.view',
            'students.view_all',
            'students.view_history',
        ]);

        // Registrar: admissions ownership only. Registrars manage applicants,
        // applications, documents, assessments and admission decisions.
        // They do NOT create academic sessions, terms, stages, class levels
        // or subjects by default.
        Role::findByName('Registrar')->syncPermissions([
            'employees.view',
            'academic.view',
            'sessions.view',
            'terms.view',
            'stages.view',
            'class_levels.view',
            'classes.view',
            'subjects.view',
            'admissions.view',
            'admissions.create',
            'admissions.edit',
            'admissions.review',
            'admissions.assess',
            'admissions.approve',
            'admissions.reject',
            'admissions.withdraw',
            'admissions.convert',
            'admissions.manage_documents',

            // Stage 5: registrars access admission-related student records.
            // Enrolment access is only granted when explicitly assigned.
            'students.view',
            'students.view_all',
            'students.view_documents',
            'students.view_history',
        ]);

        // Teacher: read-only access to academic classes and subjects.
        // Teachers must NOT create or manage academic sessions, terms,
        // stages, class levels, classes, arms or subjects.
        Role::findByName('Teacher')->syncPermissions([
            'classes.view',
            'subjects.view',
        ]);

        // Form Master: view of their class and subjects — no configuration.
        Role::findByName('Form Master')->syncPermissions([
            'classes.view',
            'subjects.view',
        ]);

        // Assistant Form Master: restricted assistant access — no configuration.
        Role::findByName('Assistant Form Master')->syncPermissions([
            'classes.view',
            'subjects.view',
        ]);

        // Student: portal access (future stages)
        Role::findByName('Student')->syncPermissions([]);

        if ($this->command) {
            $this->command->info('Roles and permissions seeded successfully.');
        }
    }
}
