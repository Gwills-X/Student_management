<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stage 5: add permanent biodata columns to the students table.
 *
 * Biodata is copied from the admission application at conversion time and
 * becomes the authoritative student profile. The admission application is
 * preserved untouched as historical record.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('admission_date');
            $table->string('gender', 20)->nullable()->after('date_of_birth');
            $table->string('nationality')->nullable();
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();
            $table->text('residential_address')->nullable();
            $table->string('phone_number', 30)->nullable();
            $table->string('personal_email')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('blood_group', 10)->nullable();
            $table->string('genotype', 10)->nullable();
            $table->text('medical_conditions')->nullable();

            $table->string('guardian_name')->nullable();
            $table->string('guardian_relationship', 50)->nullable();
            $table->string('guardian_phone', 30)->nullable();
            $table->string('guardian_email')->nullable();
            $table->text('guardian_address')->nullable();

            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
            $table->string('emergency_contact_relationship', 50)->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->index('gender');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn([
                'date_of_birth', 'gender', 'nationality', 'state_of_origin', 'lga',
                'residential_address', 'phone_number', 'personal_email', 'photo_path',
                'blood_group', 'genotype', 'medical_conditions',
                'guardian_name', 'guardian_relationship', 'guardian_phone',
                'guardian_email', 'guardian_address',
                'emergency_contact_name', 'emergency_contact_phone',
                'emergency_contact_relationship',
                'created_by', 'updated_by',
            ]);
        });
    }
};
