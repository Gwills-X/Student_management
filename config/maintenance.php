<?php

/*
|--------------------------------------------------------------------------
| Maintenance Panel Configuration
|--------------------------------------------------------------------------
|
| Server-side configuration for the restricted production deployment &
| maintenance panel (/admin/maintenance). Nothing here is ever sent to the
| browser. The deployment password is NEVER stored or compared in plain
| text: set MAINTENANCE_PASSWORD_HASH to a bcrypt/argon2 hash generated
| with `php -r "echo password_hash('your-password', PASSWORD_DEFAULT);"`.
|
| EMERGENCY DISABLE: set MAINTENANCE_PANEL_ENABLED=false to lock the whole
| panel out instantly, regardless of role or password.
|
*/

return [

    /*
    |------------------------------------------------------------------
    | Emergency kill switch. When false, every maintenance route is denied.
    |------------------------------------------------------------------
    */
    'enabled' => env('MAINTENANCE_PANEL_ENABLED', true),

    /*
    |------------------------------------------------------------------
    | Hash of the additional deployment maintenance password.
    | In production this MUST be set (panel is denied otherwise).
    |------------------------------------------------------------------
    */
    'password_hash' => env('MAINTENANCE_PASSWORD_HASH'),

    /*
    |------------------------------------------------------------------
    | How long a successful password re-authentication lasts (seconds).
    | Sensitive POST operations require a valid, unexpired session grant.
    |------------------------------------------------------------------
    */
    'reauth_lifetime' => (int) env('MAINTENANCE_REAUTH_LIFETIME', 900),

    /*
    |------------------------------------------------------------------
    | Rate limit: attempts per minute on maintenance routes.
    |------------------------------------------------------------------
    */
    'rate_limit' => (int) env('MAINTENANCE_RATE_LIMIT', 10),

    /*
    |------------------------------------------------------------------
    | Concurrency lock timeout (seconds). Prevents overlapping maintenance
    | operations on shared hosting.
    |------------------------------------------------------------------
    */
    'lock_timeout' => 120,

    /*
    |------------------------------------------------------------------
    | Approved seeder registry. Each entry is keyed by a stable slug the
    | browser may reference; the class is resolved ONLY from this file.
    | To approve a new seeder after a deployment, add an entry here and
    | redeploy. Classes are validated (must exist and extend Seeder).
    |
    | 'groups' are named bundles executed entry-by-entry, in order.
    |------------------------------------------------------------------
    */
    'seeders' => [
        'roles-and-permissions' => [
            'class'       => Database\Seeders\RolesAndPermissionsSeeder::class,
            'description' => 'Re-syncs role and permission definitions (idempotent).',
            'dangerous'   => false,
        ],
        'employee-categories' => [
            'class'       => Database\Seeders\EmployeeCategoriesSeeder::class,
            'description' => 'Ensures employee categories exist (idempotent).',
            'dangerous'   => false,
        ],
        'academic-structure' => [
            'class'       => Database\Seeders\AcademicStructureSeeder::class,
            'description' => 'Education stages / class levels reference data.',
            'dangerous'   => false,
        ],
    ],

    'seeder_groups' => [
        'core-reference-data' => [
            'description' => 'Roles, employee categories and academic structure reference data.',
            'seeders'     => ['roles-and-permissions', 'employee-categories', 'academic-structure'],
        ],
    ],

    /*
    |------------------------------------------------------------------
    | Artisan command allowlists. The browser can only send the keys
    | below; command signatures are resolved server-side.
    |------------------------------------------------------------------
    */
    'cache_clear' => [
        'cache'  => ['command' => 'cache:clear', 'label' => 'Application cache'],
        'config' => ['command' => 'config:clear', 'label' => 'Configuration cache'],
        'route'  => ['command' => 'route:clear', 'label' => 'Route cache'],
        'view'   => ['command' => 'view:clear', 'label' => 'Compiled views'],
        'optimize-clear' => ['command' => 'optimize:clear', 'label' => 'All caches (optimize:clear)'],
    ],

    'cache_rebuild' => [
        'config' => ['command' => 'config:cache', 'label' => 'Configuration cache'],
        'route'  => ['command' => 'route:cache', 'label' => 'Route cache (fails if routes use closures)'],
        'view'   => ['command' => 'view:cache', 'label' => 'Compiled views'],
    ],

    'optimization' => [
        'optimize'       => ['command' => 'optimize', 'label' => 'Full optimize (config+route+view)'],
        'optimize-clear' => ['command' => 'optimize:clear', 'label' => 'Clear all optimizations'],
    ],
];
