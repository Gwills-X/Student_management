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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_number')->unique()->index();
            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->constrained('users')
                ->nullOnDelete();

            // Personal Information
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('profile_photo_path')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable(); // Male, Female, Other
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();

            // Contact Information
            $table->string('phone_number');
            $table->string('alt_phone_number')->nullable();
            $table->string('email')->nullable();
            $table->text('residential_address');

            // Employment Information
            $table->foreignId('employee_category_id')
                ->constrained('employee_categories')
                ->restrictOnDelete();
            $table->string('job_title');
            $table->string('department')->nullable();
            $table->string('employment_type')->default('Full-time'); // Full-time, Part-time, Contract, Probation, Temporary
            $table->date('date_employed');
            $table->string('employment_status')->default('Active'); // Active, On Leave, Suspended, Retired, Resigned, Terminated

            // Additional Details
            $table->text('qualifications')->nullable();
            $table->text('additional_notes')->nullable();

            $table->timestamps();

            // Indexes for search and filtering
            $table->index('employment_status');
            $table->index('job_title');
            $table->index('employment_type');
            $table->index(['last_name', 'first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
