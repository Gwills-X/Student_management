<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'education_stage_id',
        'name',
        'code',
        'progression_order',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'progression_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(EducationStage::class, 'education_stage_id');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'class_level_id');
    }
}
