<?php

namespace App\Services;

use App\Models\EmployeeSequence;
use Illuminate\Support\Facades\DB;

class EmployeeNumberGenerator
{
    /**
     * Generate the next unique, concurrency-safe employee number.
     * Format: STAFF/{YEAR}/{SEQUENCE} e.g. STAFF/2026/0001
     *
     * Utilizes MySQL row-level locking (SELECT ... FOR UPDATE) inside
     * a database transaction to prevent duplicate sequence generation
     * even under high concurrency. Numbers are permanent and never reused.
     */
    public static function generate(?int $year = null): string
    {
        $year = $year ?? (int) date('Y');

        return DB::transaction(function () use ($year) {
            $sequence = EmployeeSequence::where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                $sequence = EmployeeSequence::create([
                    'year' => $year,
                    'last_number' => 0,
                ]);

                // Re-lock the newly created sequence
                $sequence = EmployeeSequence::where('year', $year)
                    ->lockForUpdate()
                    ->first();
            }

            $sequence->last_number += 1;
            $sequence->save();

            return sprintf('STAFF/%d/%04d', $year, $sequence->last_number);
        });
    }
}
