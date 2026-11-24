<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Class-Subject assignment pivot. Links actual classes to the subjects
     * offered in that class. Does NOT assign teachers (reserved for later stages).
     */
    public function up(): void
    {
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')
                ->constrained('classes')
                ->cascadeOnDelete();
            $table->foreignId('subject_id')
                ->constrained('subjects')
                ->restrictOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['class_id', 'subject_id']);
            $table->index('class_id');
            $table->index('subject_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_subjects');
    }
};
