<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_number',
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'profile_photo_path',
        'date_of_birth',
        'gender',
        'state_of_origin',
        'lga',
        'phone_number',
        'alt_phone_number',
        'email',
        'residential_address',
        'employee_category_id',
        'job_title',
        'department',
        'employment_type',
        'date_employed',
        'employment_status',
        'qualifications',
        'additional_notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
            'date_employed' => 'date:Y-m-d',
        ];
    }

    protected $appends = [
        'full_name',
        'has_account',
        'profile_photo_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EmployeeCategory::class, 'employee_category_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim("{$this->first_name} " . ($this->middle_name ? "{$this->middle_name} " : '') . "{$this->last_name}")
        );
    }

    public function hasAccount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user_id !== null
        );
    }

    public function profilePhotoUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->profile_photo_path) {
                    return Storage::url($this->profile_photo_path);
                }
                return null;
            }
        );
    }

    /**
     * Scope query to apply search and filters.
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('employee_number', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%");
            });
        });

        $query->when($filters['category_id'] ?? null, function ($query, $categoryId) {
            $query->where('employee_category_id', $categoryId);
        });

        $query->when($filters['employment_status'] ?? null, function ($query, $status) {
            $query->where('employment_status', $status);
        });

        $query->when($filters['employment_type'] ?? null, function ($query, $type) {
            $query->where('employment_type', $type);
        });

        $query->when($filters['job_title'] ?? null, function ($query, $jobTitle) {
            $query->where('job_title', 'like', "%{$jobTitle}%");
        });

        $query->when(isset($filters['account_status']) && $filters['account_status'] !== '', function ($query) use ($filters) {
            $status = $filters['account_status'];
            if ($status === 'with_account') {
                $query->whereNotNull('user_id');
            } elseif ($status === 'without_account') {
                $query->whereNull('user_id');
            } elseif ($status === 'account_active') {
                $query->whereHas('user', fn ($q) => $q->where('is_active', true));
            } elseif ($status === 'account_inactive') {
                $query->whereHas('user', fn ($q) => $q->where('is_active', false));
            }
        });
    }
}
