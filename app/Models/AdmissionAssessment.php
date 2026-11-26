<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_application_id', 'assessment_type', 'assessment_date',
        'score', 'maximum_score', 'outcome', 'remarks', 'status', 'assessor_id',
    ];

    protected function casts(): array
    {
        return [
            'assessment_date' => 'date',
            'score' => 'decimal:2',
            'maximum_score' => 'decimal:2',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(AdmissionApplication::class, 'admission_application_id');
    }

    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
