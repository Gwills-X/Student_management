<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Session-specific actual classes and arms (e.g. JSS 1A in 2026/2027).
     * JSS 1A in 2025/2026 is an entirely distinct record from JSS 1A in 2026/2027.
     */
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_session_id')
                ->constrained('academic_sessions')
                ->restrictOnDelete();
            $table->foreignId('class_level_id')
                ->constrained('class_levels')
                ->restrictOnDelete();
            $table->string('arm'); // "A", "B", "Gold", "Diamond"
            $table->string('name'); // "JSS 1A", "Primary 2B"
            $table->string('classroom')->nullable(); // "Room 102", "Block B"
            $table->unsignedSmallInteger('capacity')->nullable()->default(35);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // An arm of a level can only exist once per academic session
            $table->unique(['academic_session_id', 'class_level_id', 'arm']);
            $table->index('academic_session_id');
            $table->index('class_level_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
