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
        Schema::create('class_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_stage_id')
                ->constrained('education_stages')
                ->restrictOnDelete();
            $table->string('name'); // e.g. "KG 1", "Primary 1", "JSS 1", "SS 1"
            $table->string('code'); // e.g. "KG1", "PRI1", "JSS1", "SS1"
            $table->unsignedSmallInteger('progression_order')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['education_stage_id', 'code']);
            $table->unique(['education_stage_id', 'name']);
            $table->index('progression_order');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_levels');
    }
};
