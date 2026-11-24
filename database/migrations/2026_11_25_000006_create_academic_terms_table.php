<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_session_id')
                ->constrained('academic_sessions')
                ->restrictOnDelete();
            $table->string('name'); // "First Term", "Second Term", "Third Term"
            $table->unsignedTinyInteger('term_order'); // 1, 2, 3
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('upcoming'); // upcoming, active, completed
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            $table->unique(['academic_session_id', 'name']);
            $table->unique(['academic_session_id', 'term_order']);
            $table->index('is_current');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_terms');
    }
};
