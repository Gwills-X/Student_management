<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class AcademicSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
        'is_current',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'is_current' => 'boolean',
        ];
    }

    public function terms(): HasMany
    {
        return $this->hasMany(AcademicTerm::class)->orderBy('term_order');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'academic_session_id');
    }

    /**
     * Scope query to only current session.
     */
    public function scopeCurrent(Builder $query): void
    {
        $query->where('is_current', true);
    }

    /**
     * Mark this session as the sole current active session in the school.
     */
    public function makeCurrent(): void
    {
        DB::transaction(function () {
            // Unset current from all other sessions
            static::where('id', '!=', $this->id)->update([
                'is_current' => false,
            ]);

            // Set this session to current and active
            $this->is_current = true;
            $this->status = 'active';
            $this->save();
        });
    }

    /**
     * Check if session has referenced records that prevent deletion.
     */
    public function hasReferences(): bool
    {
        return $this->terms()->exists() || $this->classes()->exists();
    }
}
