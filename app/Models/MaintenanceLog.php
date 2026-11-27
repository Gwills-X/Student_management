<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Audit record for maintenance panel operations.
 *
 * Never store: passwords, credentials, APP_KEY, full stack traces or
 * environment values in `output`. The MaintenanceService sanitizes output
 * before persisting it.
 */
class MaintenanceLog extends Model
{
    protected $fillable = [
        'user_id',
        'username',
        'action',
        'target',
        'success',
        'output',
        'ip_address',
    ];

    protected $casts = [
        'success' => 'boolean',
    ];
}
