<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admission_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('applicant_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('academic_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('education_stage_id')->constrained()->restrictOnDelete();
            $table->foreignId('class_level_id')->constrained()->restrictOnDelete();
            $table->date('application_date');
            $table->string('status')->default('Draft');

            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('nationality')->nullable();
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();
            $table->text('residential_address')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('email')->nullable();

            $table->string('previous_school_name')->nullable();
            $table->string('previous_school_address')->nullable();
            $table->string('previous_class')->nullable();
            $table->text('previous_academic_record')->nullable();

            $table->string('guardian_name')->nullable();
            $table->string('guardian_relationship')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_email')->nullable();
            $table->text('guardian_address')->nullable();
            $table->text('remarks')->nullable();

            $table->text('decision_remarks')->nullable();
            $table->foreignId('decision_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decision_at')->nullable();

            $table->foreignId('converted_student_id')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->foreignId('converted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['applicant_user_id', 'academic_session_id', 'class_level_id'], 'admission_unique_applicant_cycle');
            $table->index(['status', 'application_date']);
            $table->index(['academic_session_id', 'class_level_id']);
        });

        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('admission_number')->unique();
            $table->foreignId('user_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('academic_session_id')->constrained()->restrictOnDelete();
            $table->foreignId('education_stage_id')->constrained()->restrictOnDelete();
            $table->foreignId('class_level_id')->constrained()->restrictOnDelete();
            $table->foreignId('admission_application_id')->unique()->constrained()->restrictOnDelete();
            $table->date('admission_date');
            $table->string('status')->default('Active');
            $table->timestamps();

            $table->index(['academic_session_id', 'class_level_id']);
            $table->index('status');
        });

        Schema::table('admission_applications', function (Blueprint $table) {
            $table->foreign('converted_student_id')->references('id')->on('students')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->dropForeign(['converted_student_id']);
        });
        Schema::dropIfExists('students');
        Schema::dropIfExists('admission_applications');
    }
};
