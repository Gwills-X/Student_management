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

        // Registrar: record & class viewing
        Role::findByName('Registrar')->syncPermissions([
            'users.view',
            'employees.view',
            'academic.view',
            'sessions.view',
            'terms.view',
            'stages.view',
            'class_levels.view',
            'classes.view',
            'classes.create',
            'classes.edit',
            'subjects.view',
            'class_subjects.manage',
        ]);

        // Teacher: view academic classes and subjects
        Role::findByName('Teacher')->syncPermissions([
            'academic.view',
            'classes.view',
            'subjects.view',
        ]);

        Role::findByName('Form Master')->syncPermissions([
            'academic.view',
            'classes.view',
            'subjects.view',
        ]);

        Role::findByName('Assistant Form Master')->syncPermissions([
            'academic.view',
            'classes.view',
            'subjects.view',
        ]);

        // Student: portal access (future stages)
        Role::findByName('Student')->syncPermissions([]);

        $this->command->info('Roles and permissions seeded successfully.');
    }
}
