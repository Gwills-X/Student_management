<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Modifies the default Laravel users table to support school management needs:
 * - Adds `username` as the primary login identifier (required, unique).
 * - Makes `email` nullable (young students may not have email addresses).
 * - Adds `is_active` to allow administrators to disable accounts without deleting them.
 *
 * Soft-deletes decision: NOT applied to the users table because:
 * 1. Soft-deleted rows still occupy unique-constraint slots (username/email),
 *    so a deleted user's username could not be reused without extra logic.
 * 2. Authentication guards query `users` without a `whereNull('deleted_at')` scope
 *    by default, which would need patching to prevent soft-deleted users from logging in.
 * 3. `is_active = false` satisfies the requirement to disable accounts safely.
 *    Hard deletion is acceptable for a single-school system without audit-trail needs.
 *    If audit trails are needed later, an `audit_logs` table is a better pattern.
 *
 * This migration is idempotent: each change is guarded by a hasColumn/hasIndex check
 * so it is safe to re-run on a database that already has these changes applied.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username')->unique()->after('name');
            }

            if (Schema::hasColumn('users', 'email')) {
                $table->string('email')->nullable()->change();
            }

            if (! Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username')) {
                $table->dropUnique('users_username_unique');
                $table->dropColumn('username');
            }

            if (Schema::hasColumn('users', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (Schema::hasColumn('users', 'email')) {
                try {
                    $table->dropUnique('users_email_unique');
                } catch (\Exception $e) {
                    // ignore
                }
                $table->string('email')->nullable(false)->change();
                $table->unique('email');
            }
        });
    }

};
