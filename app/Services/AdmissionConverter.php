<?php

namespace App\Services;

use App\Models\AdmissionApplication;
use App\Models\Student;
use App\Models\StudentStatusHistory;
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

                // Stage 5: copy biodata from the application. The application
                // itself is never modified and remains the historical record.
                'date_of_birth' => $application->date_of_birth,
                'gender' => $application->gender,
                'nationality' => $application->nationality,
                'state_of_origin' => $application->state_of_origin,
                'lga' => $application->lga,
                'residential_address' => $application->residential_address,
                'phone_number' => $application->phone_number,
                'guardian_name' => $application->guardian_name,
                'guardian_relationship' => $application->guardian_relationship,
                'guardian_phone' => $application->guardian_phone,
                'guardian_email' => $application->guardian_email,
                'guardian_address' => $application->guardian_address,
                'emergency_contact_name' => $application->guardian_name,
                'emergency_contact_phone' => $application->guardian_phone,
                'emergency_contact_relationship' => $application->guardian_relationship,
                'created_by' => $staff->id,
            ]);

            // Stage 5 rule: admission conversion and class enrolment are kept
            // logically distinct. The initial actual-class placement is created
            // through StudentEnrolmentService by authorised personnel, not here.
            StudentStatusHistory::create([
                'student_id' => $student->id,
                'from_status' => null,
                'to_status' => 'Active',
                'remarks' => "Converted from admission application {$application->application_number}.",
                'changed_by' => $staff->id,
                'changed_at' => now(),
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
