<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Makes class arm optional (nullable) and enforces uniqueness of the actual
     * class name within an academic session (e.g. "JSS 1" or "JSS 1A" unique in session).
     */
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            // Drop old composite unique constraint
            $table->dropUnique('classes_academic_session_id_class_level_id_arm_unique');

            // Make arm nullable
            $table->string('arm', 30)->nullable()->change();

            // Enforce uniqueness of actual class name within the academic session
            $table->unique(['academic_session_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique(['academic_session_id', 'name']);
            $table->string('arm', 30)->nullable(false)->change();
            $table->unique(['academic_session_id', 'class_level_id', 'arm']);
        });
    }
};
