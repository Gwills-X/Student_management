<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Pivot table linking subjects to applicable education stages.
     * For example, Mathematics applies to KG, Primary, JSS, and SSS,
     * while Physics applies only to Senior Secondary.
     */
    public function up(): void
    {
        Schema::create('education_stage_subject', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_stage_id')
                ->constrained('education_stages')
                ->cascadeOnDelete();
            $table->foreignId('subject_id')
                ->constrained('subjects')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['education_stage_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_stage_subject');
    }
};
