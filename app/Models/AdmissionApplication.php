<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AdmissionApplication extends Model
{
    use HasFactory;

    public const STATUSES = [
        'Draft', 'Submitted', 'Under Review', 'Assessment Pending',
        'Assessment Completed', 'Approved', 'Rejected', 'Withdrawn',
    ];

    protected $fillable = [
        'application_number', 'applicant_user_id', 'academic_session_id',
        'education_stage_id', 'class_level_id', 'application_date', 'status',
        'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender',
        'nationality', 'state_of_origin', 'lga', 'residential_address',
        'phone_number', 'email', 'previous_school_name', 'previous_school_address',
        'previous_class', 'previous_academic_record', 'guardian_name',
        'guardian_relationship', 'guardian_phone', 'guardian_email',
        'guardian_address', 'remarks', 'decision_remarks', 'decision_by',
        'decision_at', 'converted_student_id', 'converted_at', 'converted_by',
        'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'application_date' => 'date',
            'date_of_birth' => 'date',
            'decision_at' => 'datetime',
            'converted_at' => 'datetime',
        ];
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_user_id');
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function educationStage(): BelongsTo
    {
        return $this->belongsTo(EducationStage::class);
    }

    public function classLevel(): BelongsTo
    {
        return $this->belongsTo(ClassLevel::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(AdmissionAssessment::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AdmissionDocument::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(AdmissionStatusHistory::class)->latest('changed_at');
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class, 'admission_application_id');
    }

    public function isConverted(): bool
    {
        return $this->converted_at !== null || $this->converted_student_id !== null;
    }
}
