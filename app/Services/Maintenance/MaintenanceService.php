<?php

namespace App\Services\Maintenance;

use App\Models\MaintenanceLog;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Central service for the restricted maintenance panel.
 *
 * Guarantees:
 *  - Every Artisan command executed via runCommand() comes from a
 *    server-side allowlist (config/maintenance.php). Browser input can only
 *    reference allowlist KEYS.
 *  - A concurrency lock prevents overlapping mutating operations.
 *  - Output is sanitized (credentials / stack traces stripped) before it is
 *    returned to the UI or persisted to the audit log.
 *  - Failures are reported honestly — never a fake success.
 */
class MaintenanceService
{
    public const REAUTH_SESSION_KEY = 'maintenance.reauth_until';

    /** Commands that must NEVER be runnable from this panel, even by accident. */
    private const FORBIDDEN_COMMANDS = [
        'migrate:fresh', 'migrate:refresh', 'migrate:reset', 'migrate:rollback',
        'db:wipe', 'db:seed', 'down', 'app:down',
    ];

    // ── Re-authentication (deployment password) ─────────────────────────────

    public function verifyDeploymentPassword(?string $password): bool
    {
        $hash = (string) config('maintenance.password_hash');

        if ($hash === '' || ! $password) {
            return false;
        }

        return Hash::check($password, $hash);
    }

    public function grantReauth(): void
    {
        session()->put(
            self::REAUTH_SESSION_KEY,
            now()->addSeconds((int) config('maintenance.reauth_lifetime', 900))->timestamp,
        );
    }

    public function reauthValid(): bool
    {
        $until = session(self::REAUTH_SESSION_KEY);

        return is_numeric($until) && ((int) $until) >= now()->timestamp;
    }

    /**
     * For mutating operations: require an unexpired re-auth grant.
     * Returns an error string or null when authorized.
     */
    public function reauthError(): ?string
    {
        return $this->reauthValid()
            ? null
            : 'Re-authentication required. Enter the deployment maintenance password again.';
    }

    // ── Concurrency lock ────────────────────────────────────────────────────

    private function lockKey(): string
    {
        return 'maintenance:operation-lock';
    }

    /**
     * Acquire the maintenance lock. Returns null on success or the seconds
     * remaining before the current operation finishes.
     *
     * Uses a portable Cache::add spinlock (works on every cache store,
     * including the array store used in tests and the file store used on
     * InfinityFree, which has no lock manager).
     */
    public function acquireLock(): ?int
    {
        $seconds = (int) config('maintenance.lock_timeout', 120);

        $token = Str::uuid()->toString();

        if (! Cache::add($this->lockKey(), $token, $seconds)) {
            return $seconds;
        }

        // Store the owner token so we only release our own lock.
        session()->put('maintenance.lock_token', $token);

        return null;
    }

    public function releaseLock(): void
    {
        try {
            // Only release if we still own it (value matches our token).
            if (Cache::get($this->lockKey()) === session('maintenance.lock_token')) {
                Cache::forget($this->lockKey());
            }
        } catch (Throwable) {
            // Lock may have expired naturally — that's fine.
        } finally {
            session()->forget('maintenance.lock_token');
        }
    }

    // ── Command execution ───────────────────────────────────────────────────

    /**
     * Run an allowlisted Artisan command.
     *
     * @param  string  $command  Full signature — MUST originate from a
     *                           config/maintenance.php allowlist, never from
     *                           user input.
     * @return array{success: bool, output: string}
     */
    public function runCommand(string $command, array $parameters = []): array
    {
        if (in_array($command, self::FORBIDDEN_COMMANDS, true) || str_starts_with($command, 'migrate:rollback')) {
            return ['success' => false, 'output' => 'This command is not permitted from the maintenance panel.'];
        }

        try {
            $exitCode = Artisan::call($command, $parameters);
            $output = Artisan::output();

            return [
                'success' => $exitCode === 0,
                'output'  => $this->sanitize($output),
            ];
        } catch (Throwable $e) {
            Log::error('Maintenance command failed: '.$command, ['exception' => $e::class]);

            return [
                'success' => false,
                // Generic message — no stack traces or host paths to the client.
                'output'  => 'The command did not complete: '.Str::of($e->getMessage())->limit(200),
            ];
        }
    }

    /**
     * Run a pending-migrations migration (migrate --force only).
     */
    public function runMigrations(): array
    {
        return $this->runCommand('migrate', ['--force' => true]);
    }

    /**
     * Execute a seeder by allowlist slug. The class is resolved only from
     * config/maintenance.php — never from browser input.
     *
     * @return array{success: bool, output: string, class?: string}
     */
    public function runSeeder(string $slug): array
    {
        $registry = config('maintenance.seeders', []);

        if (! isset($registry[$slug])) {
            return ['success' => false, 'output' => 'Unknown or unapproved seeder.'];
        }

        $class = $registry[$slug]['class'] ?? null;

        if (! $class || ! class_exists($class) || ! is_subclass_of($class, \Illuminate\Database\Seeder::class)) {
            return ['success' => false, 'output' => 'The registered seeder class is invalid on this deployment.'];
        }

        try {
            $exitCode = Artisan::call('db:seed', [
                '--class' => $class,
                '--force' => true,
            ]);

            return [
                'success' => $exitCode === 0,
                'output'  => $this->sanitize(Artisan::output()),
                'class'   => $class,
            ];
        } catch (Throwable $e) {
            Log::error('Maintenance seeder failed: '.$slug, ['exception' => $e::class]);

            return [
                'success' => false,
                'output'  => 'The seeder did not complete: '.Str::of($e->getMessage())->limit(200),
            ];
        }
    }

    // ── Diagnostics (read-only, safe) ────────────────────────────────────────

    public function dashboardData(): array
    {
        return [
            'laravel_version'  => app()->version(),
            'php_version'      => PHP_VERSION,
            'environment'      => app()->environment(),
            'debug_enabled'    => (bool) config('app.debug'),
            'db_connected'     => $this->dbConnected(),
            'migrations_table' => $this->migrationsTableExists(),
            'storage_link'     => $this->storageLinkStatus(),
            'build_manifest'   => file_exists(public_path('build/manifest.json')),
            'env_present'      => file_exists(base_path('.env')), // existence only — never read
            'app_key_set'      => (bool) config('app.key'),
            'reauth_valid'     => $this->reauthValid(),
            'writable_dirs'    => $this->writableDirectories(),
            'seeders'          => $this->seederRegistry(),
            'cache_actions'    => array_keys(config('maintenance.cache_clear', [])),
            'rebuild_actions'  => array_keys(config('maintenance.cache_rebuild', [])),
            'optimization_actions' => array_keys(config('maintenance.optimization', [])),
            'recent_logs'      => $this->recentLogs(),
        ];
    }

    public function migrationStatus(): array
    {
        if (! $this->migrationsTableExists()) {
            return [
                'available'      => false,
                'migrations'     => [],
                'pending_count'  => null,
                'ran_count'      => null,
            ];
        }

        $ran = DB::table('migrations')->orderBy('batch')->orderBy('id')->get();
        $ranNames = $ran->pluck('migration')->all();

        $files = glob(database_path('migrations/*.php')) ?: [];
        $all = [];
        foreach ($files as $file) {
            $all[] = basename($file, '.php');
        }

        $pending = array_values(array_diff($all, $ranNames));

        return [
            'available'      => true,
            'migrations'     => collect($all)->map(fn ($name) => [
                'name'   => $name,
                'ran'    => in_array($name, $ranNames, true),
                'batch'  => optional($ran->firstWhere('migration', $name))->batch,
            ])->values()->all(),
            'pending'        => $pending,
            'pending_count'  => count($pending),
            'ran_count'      => count($ranNames),
        ];
    }

    public function writableDirectories(): array
    {
        $dirs = [
            'storage/framework/cache',
            'storage/framework/sessions',
            'storage/framework/views',
            'storage/logs',
            'storage/app',
            'bootstrap/cache',
        ];

        return collect($dirs)->mapWithKeys(fn ($dir) => [
            $dir => is_dir(base_path($dir)) && is_writable(base_path($dir)),
        ])->all();
    }

    /**
     * @return array{exists: bool, is_link: bool, is_dir: bool, points_to: string|null, target_accessible: bool}
     */
    public function storageLinkStatus(): array
    {
        $publicStorage = public_path('storage');

        $status = [
            'exists'            => file_exists($publicStorage) || is_link($publicStorage),
            'is_link'           => is_link($publicStorage),
            'is_dir'            => is_dir($publicStorage) && ! is_link($publicStorage),
            'points_to'         => null,
            'target_accessible' => false,
        ];

        if ($status['is_link']) {
            $status['points_to'] = readlink($publicStorage);
            $status['target_accessible'] = is_dir($publicStorage);
        } elseif ($status['is_dir']) {
            $status['target_accessible'] = true;
        }

        return $status;
    }

    public function seederRegistry(): array
    {
        return collect(config('maintenance.seeders', []))->map(fn ($entry, $slug) => [
            'slug'        => $slug,
            'class'       => $entry['class'],
            'description' => $entry['description'] ?? '',
            'dangerous'   => (bool) ($entry['dangerous'] ?? false),
            'class_valid' => class_exists($entry['class'])
                && is_subclass_of($entry['class'], \Illuminate\Database\Seeder::class),
        ])->values()->all();
    }

    public function seederGroups(): array
    {
        return collect(config('maintenance.seeder_groups', []))->map(fn ($group, $slug) => [
            'slug'        => $slug,
            'description' => $group['description'] ?? '',
            'seeders'     => $group['seeders'] ?? [],
        ])->values()->all();
    }

    public function recentLogs(int $limit = 8): array
    {
        return MaintenanceLog::query()
            ->latest()
            ->limit($limit)
            ->get(['id', 'username', 'action', 'target', 'success', 'created_at'])
            ->toArray();
    }

    // ── Audit logging ───────────────────────────────────────────────────────

    public function record(string $action, bool $success, string $output, ?string $target = null): void
    {
        $user = auth()->user();

        MaintenanceLog::create([
            'user_id'    => $user?->id,
            'username'   => $user?->username,
            'action'     => $action,
            'target'     => $target,
            'success'    => $success,
            'output'     => $this->sanitize($output),
            'ip_address' => request()?->ip(),
        ]);
    }

    // ── Output sanitization ─────────────────────────────────────────────────

    /**
     * Strip credentials, absolute server paths and reduce output length so
     * nothing sensitive reaches the UI or the audit log.
     */
    public function sanitize(?string $output): string
    {
        $output = (string) $output;

        // Redact obvious secrets.
        $output = preg_replace('/\b[A-Za-z0-9_\-]{40,}\b/', '[redacted]', $output);
        $output = preg_replace('/(password|secret|key|token)[=:]\s*\S+/i', '$1=[redacted]', $output);

        // Replace absolute filesystem paths with a generic marker.
        $basePath = base_path();
        if ($basePath) {
            $output = str_replace($basePath, '[app]', $output);
        }

        $output = str_replace(['C:\\', 'c:\\', '/home/', 'C:/'], '[path]', $output);

        // Collapse whitespace and hard-limit length.
        $output = trim(preg_replace('/\s+/', ' ', $output) ?? '');
        $output = Str::limit($output, 600);

        return $output;
    }

    // ── Small helpers ───────────────────────────────────────────────────────

    public function dbConnected(): bool
    {
        try {
            DB::select('select 1');

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    public function migrationsTableExists(): bool
    {
        if (! $this->dbConnected()) {
            return false;
        }

        try {
            return Schema::hasTable('migrations');
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * Wraps a mutating operation with lock acquisition / guaranteed release
     * and audit logging, so controllers stay thin and locks never leak.
     *
     * @param  callable(): array{success: bool, output: string, ...}  $operation
     * @return array{success: bool, output: string, locked_out?: int}
     */
    public function withLock(string $action, ?string $target, callable $operation): array
    {
        $busy = $this->acquireLock();

        if ($busy !== null) {
            return [
                'success'    => false,
                'locked_out' => $busy,
                'output'     => 'Another maintenance operation is currently running. Please wait a moment and try again.',
            ];
        }

        try {
            $result = $operation();
        } catch (Throwable $e) {
            Log::error('Maintenance operation threw: '.$action, ['exception' => $e::class]);
            $result = ['success' => false, 'output' => 'The operation did not complete due to an unexpected server error.'];
        } finally {
            $this->releaseLock();
        }

        $this->record($action, $result['success'] ?? false, $result['output'] ?? '', $target);

        return $result;
    }
}
