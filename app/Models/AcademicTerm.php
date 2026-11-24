<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class AcademicTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_session_id',
        'name',
        'term_order',
        'start_date',
        'end_date',
        'status',
        'is_current',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'is_current' => 'boolean',
            'term_order' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    /**
     * Scope query to the current term.
     */
    public function scopeCurrent(Builder $query): void
    {
        $query->where('is_current', true);
    }

    /**
     * Mark this term as the sole current term across the school.
     */
    public function makeCurrent(): void
    {
        DB::transaction(function () {
            // Unset current indicator across all terms in the school
            static::where('is_current', true)->update([
                'is_current' => false,
            ]);

            // Set this term as current and active
            $this->is_current = true;
            $this->status = 'active';
            $this->save();

            // Ensure its parent session is also marked as current
            if ($this->session && ! $this->session->is_current) {
                $this->session->makeCurrent();
            }
        });
    }
}
