<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Facades\Storage;

class Student extends Model
{
    use HasFactory;

    public const STATUSES = ['Active', 'Graduated', 'Withdrawn', 'Transferred', 'Suspended', 'Deceased'];

    protected $fillable = [
        'admission_number', 'user_id', 'academic_session_id',
        'education_stage_id', 'class_level_id', 'admission_application_id',
        'admission_date', 'status',
        'date_of_birth', 'gender', 'nationality', 'state_of_origin', 'lga',
        'residential_address', 'phone_number', 'personal_email', 'photo_path',
        'blood_group', 'genotype', 'medical_conditions',
        'guardian_name', 'guardian_relationship', 'guardian_phone',
        'guardian_email', 'guardian_address',
        'emergency_contact_name', 'emergency_contact_phone',
        'emergency_contact_relationship',
        'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return ['admission_date' => 'date', 'date_of_birth' => 'date'];
    }

    protected $appends = ['full_name', 'photo_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(AdmissionApplication::class, 'admission_application_id');
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(EducationStage::class, 'education_stage_id');
    }

    public function classLevel(): BelongsTo
    {
        return $this->belongsTo(ClassLevel::class);
    }

    public function enrolments(): HasMany
    {
        return $this->hasMany(StudentEnrolment::class)->orderByDesc('academic_session_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(StudentStatusHistory::class)->orderByDesc('changed_at');
    }

    public function transferHistories(): HasMany
    {
        return $this->hasMany(StudentTransferHistory::class)->orderByDesc('transfer_date');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * The most recent enrolment (current placement), regardless of status.
     */
    public function currentEnrolment(): HasOne
    {
        return $this->hasOne(StudentEnrolment::class)
            ->orderByDesc('academic_session_id')
            ->orderByDesc('id');
    }

    /**
     * The enrolment marked Active for the given session (or current session).
     */
    public function activeEnrolmentFor(?int $sessionId = null): ?StudentEnrolment
    {
        return $this->enrolments()
            ->where('academic_session_id', $sessionId ?? AcademicSession::where('is_current', true)->value('id'))
            ->where('status', 'Active')
            ->first();
    }

    public function currentEnrolmentFor(?int $sessionId = null): ?StudentEnrolment
    {
        return $this->enrolments()
            ->where('academic_session_id', $sessionId ?? AcademicSession::where('is_current', true)->value('id'))
            ->first();
    }

    /**
     * Directory display name — biodata first, falling back to the user account.
     */
    public function applicationName(): ?string
    {
        return $this->application
            ? trim("{$this->application->first_name} {$this->application->last_name}")
            : null;
    }

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->applicationName() ?? ($this->user->name ?? 'Unknown Student')
        );
    }

    public function photoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->photo_path ? Storage::url($this->photo_path) : null
        );
    }

    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('admission_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) =>
                        $u->where('username', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%"))
                    ->orWhereHas('application', fn ($a) =>
                        $a->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%"));
            });
        });

        $query->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status));

        $query->when($filters['academic_session_id'] ?? null, function ($query, $sessionId) {
            $query->whereHas('enrolments', fn ($e) => $e->where('academic_session_id', $sessionId));
        });

        $query->when($filters['education_stage_id'] ?? null, fn ($q, $id) => $q->where('education_stage_id', $id));

        $query->when($filters['class_level_id'] ?? null, fn ($q, $id) => $q->where('class_level_id', $id));

        $query->when($filters['class_id'] ?? null, function ($query, $classId) {
            $query->whereHas('enrolments', fn ($e) => $e->where('class_id', $classId));
        });
    }
}
