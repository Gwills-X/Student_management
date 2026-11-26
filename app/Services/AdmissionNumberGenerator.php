<?php

namespace App\Services;

use App\Models\AdmissionSequence;
use Illuminate\Support\Facades\DB;

class AdmissionNumberGenerator
{
    public static function applicationNumber(?int $year = null): string
    {
        $year = $year ?? (int) date('Y');

        return DB::transaction(function () use ($year) {
            $sequence = self::lockSequence($year);
            $sequence->last_number++;
            $sequence->save();

            return sprintf('APP/%d/%04d', $year, $sequence->last_number);
        });
    }

    public static function admissionNumber(?int $year = null): string
    {
        $year = $year ?? (int) date('Y');

        return DB::transaction(function () use ($year) {
            $sequence = self::lockSequence($year);
            $sequence->last_number++;
            $sequence->save();

            return sprintf('SCH/%d/%04d', $year, $sequence->last_number);
        });
    }

    private static function lockSequence(int $year): AdmissionSequence
    {
        $sequence = AdmissionSequence::where('year', $year)->lockForUpdate()->first();

        if (! $sequence) {
            AdmissionSequence::create(['year' => $year, 'last_number' => 0]);
            $sequence = AdmissionSequence::where('year', $year)->lockForUpdate()->first();
        }

        return $sequence;
    }
}
