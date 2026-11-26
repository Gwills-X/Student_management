<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentEnrolment extends Model
{
    use HasFactory;

    public const STATUSES = ['Active', 'Completed', 'Withdrawn', 'Transferred'];

    protected $fillable = [
        'student_id', 'academic_session_id', 'class_id', 'class_level_id',
        'education_stage_id', 'enrolment_date', 'status', 'completed_date',
        'remarks', 'enrolled_by',
    ];

    protected function casts(): array
    {
        return ['enrolment_date' => 'date', 'completed_date' => 'date'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function classLevel(): BelongsTo
    {
        return $this->belongsTo(ClassLevel::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(EducationStage::class, 'education_stage_id');
    }

    public function enrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(StudentTransferHistory::class, 'academic_session_id', 'academic_session_id')
            ->where('student_id', $this->student_id);
    }

    /**
     * Display class name — falls back to level + arm if class is missing.
     */
    public function classDisplay(): string
    {
        if ($this->schoolClass) {
            return $this->schoolClass->name;
        }

        $level = $this->classLevel->name ?? 'Unknown level';

        return $this->schoolClass && $this->schoolClass->arm
            ? "{$level} {$this->schoolClass->arm}"
            : $level;
    }
}
