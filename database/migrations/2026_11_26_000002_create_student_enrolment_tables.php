<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stage 5: student enrolment, status history and transfer history tables.
 *
 * - student_enrolments: one row per (student, academic session) placement in an
 *   actual class. Unique per student+session prevents duplicate enrolments.
 * - student_status_histories: lifecycle status changes (Active, Graduated, ...).
 * - student_transfer_histories: audit trail for class-to-class transfers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_enrolments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('class_id')->constrained('classes')->restrictOnDelete();
            $table->foreignId('class_level_id')->constrained()->restrictOnDelete();
            $table->foreignId('education_stage_id')->constrained()->restrictOnDelete();
            $table->date('enrolment_date');
            $table->string('status', 30)->default('Active');
            $table->date('completed_date')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('enrolled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'academic_session_id'], 'student_enrolments_unique_student_session');
            $table->index(['academic_session_id', 'class_id']);
            $table->index('status');
        });

        Schema::create('student_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->text('remarks')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('changed_at');
            $table->timestamps();

            $table->index(['student_id', 'changed_at'], 'student_status_history_student_at_index');
        });

        Schema::create('student_transfer_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('from_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('to_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('academic_session_id')->constrained()->restrictOnDelete();
            $table->date('transfer_date');
            $table->text('reason')->nullable();
            $table->foreignId('transferred_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['student_id', 'transfer_date'], 'student_transfer_history_student_at_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_transfer_histories');
        Schema::dropIfExists('student_status_histories');
        Schema::dropIfExists('student_enrolments');
    }
};
