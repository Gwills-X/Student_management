<?php

namespace App\Services;

use App\Models\AdmissionApplication;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AdmissionConverter
{
    public static function convert(AdmissionApplication $application, $staff): Student
    {
        return DB::transaction(function () use ($application, $staff) {
            $application = AdmissionApplication::whereKey($application->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($application->status !== 'Approved') {
                throw new RuntimeException('Only approved applications can be converted.');
            }

            if ($application->isConverted()) {
                throw new RuntimeException('This application has already been converted.');
            }

            $existingStudent = Student::where('admission_application_id', $application->id)->first();
            if ($existingStudent) {
                throw new RuntimeException('A student record already exists for this application.');
            }

            $applicant = $application->applicant()->lockForUpdate()->first();
            if (! $applicant || ! $applicant->is_active) {
                throw new RuntimeException('The applicant account is unavailable.');
            }

            $student = Student::create([
                'admission_number' => AdmissionNumberGenerator::admissionNumber(),
                'user_id' => $applicant->id,
                'academic_session_id' => $application->academic_session_id,
                'education_stage_id' => $application->education_stage_id,
                'class_level_id' => $application->class_level_id,
                'admission_application_id' => $application->id,
                'admission_date' => now()->toDateString(),
                'status' => 'Active',
            ]);

            $applicant->assignRole('Student');

            $application->update([
                'converted_student_id' => $student->id,
                'converted_at' => now(),
                'converted_by' => $staff->id,
                'updated_by' => $staff->id,
            ]);

            return $student;
        });
    }
}
