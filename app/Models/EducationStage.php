<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function classLevels(): HasMany
    {
        return $this->hasMany(ClassLevel::class)->orderBy('progression_order');
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'education_stage_subject')
            ->withTimestamps();
    }
}
