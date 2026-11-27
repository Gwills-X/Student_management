<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Maintenance operation audit log.
 *
 * IMPORTANT: This migration must be run (via the maintenance panel itself is
 * NOT possible before the table exists — run `php artisan migrate` locally
 * before deploying, or allow the panel's "Run pending migrations" action to
 * create it on the server) before the operation history feature is used.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('username', 191)->nullable(); // denormalised: survives user deletion
            $table->string('action', 64);               // e.g. migrations.run, cache.clear
            $table->string('target', 191)->nullable();  // e.g. seeder slug, cache key
            $table->boolean('success')->default(false);
            $table->text('output')->nullable();          // sanitized summary, no credentials
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['action', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
