# Production Maintenance & Deployment Panel

A restricted, browser-based panel for running approved Laravel maintenance
operations on shared hosting (InfinityFree) where no SSH access exists.
Accessible only to authenticated **Super Administrator** accounts, protected
by a second, deployment-only password, CSRF, rate limiting, a concurrency
lock, and a full audit trail.

It is **not** a web terminal: no arbitrary Artisan, PHP, SQL, shell, file or
class execution exists. Every runnable command comes from a server-side
allowlist in `config/maintenance.php`.

---

## URLs & HTTP methods

| Method | URL                                   | Name                             | Purpose                             |
| ------ | ------------------------------------- | -------------------------------- | ----------------------------------- |
| GET    | `/admin/maintenance`                  | `maintenance.dashboard`          | Overview dashboard (safe)           |
| GET    | `/admin/maintenance/diagnostics`      | `maintenance.diagnostics`        | Full system diagnostics (safe)      |
| GET    | `/admin/maintenance/reauthenticate`   | `maintenance.reauth`             | Password prompt                     |
| POST   | `/admin/maintenance/reauthenticate`   | `maintenance.reauth.attempt`     | Verify deployment password          |
| GET    | `/admin/maintenance/migrations`       | `maintenance.migrations.index`   | Migration status (read-only)        |
| GET    | `/admin/maintenance/migrations/run`   | —                                | Migration **confirmation page** (safe) |
| POST   | `/admin/maintenance/migrations/run`   | `maintenance.migrations.run`     | Run pending migrations              |
| GET    | `/admin/maintenance/seeders`          | `maintenance.seeders.index`      | Approved seeder list                |
| GET    | `/admin/maintenance/seeders/run?seeder={approved-slug}` | — | Seeder **confirmation page** (safe) |
| POST   | `/admin/maintenance/seeders/run`      | `maintenance.seeders.run`        | Run one approved seeder or group    |
| GET    | `/admin/maintenance/cache`            | `maintenance.cache.index`        | Cache tools                         |
| GET    | `/admin/maintenance/cache/clear?cache={approved-key}` | — | Cache-clear **confirmation page** (safe) |
| POST   | `/admin/maintenance/cache/clear`      | `maintenance.cache.clear`        | Clear one selected cache            |
| GET    | `/admin/maintenance/cache/rebuild?cache={approved-key}` | — | Cache-rebuild **confirmation page** (safe) |
| POST   | `/admin/maintenance/cache/rebuild`    | `maintenance.cache.rebuild`      | Rebuild one selected cache          |
| GET    | `/admin/maintenance/storage`          | `maintenance.storage.index`      | Storage diagnostics                 |
| GET    | `/admin/maintenance/storage/link`     | —                                | Storage-link **confirmation page** (safe) |
| POST   | `/admin/maintenance/storage/link`     | `maintenance.storage.link`       | Create/verify `public/storage`      |
| GET    | `/admin/maintenance/optimization`     | `maintenance.optimization.index` | Optimization tools                  |
| GET    | `/admin/maintenance/optimization/run?command={approved-key}` | — | Optimization **confirmation page** (safe) |
| POST   | `/admin/maintenance/optimization/run` | `maintenance.optimization.run`   | Run one optimization command        |
| GET    | `/admin/maintenance/history`          | `maintenance.history`            | Audit log with filters + pagination |

### Browser address-bar navigation

You can type or paste an operation URL directly into the browser and press
Enter. **Visiting a URL never executes anything.** GET and POST share the same
address, distinguished only by HTTP method:

- `GET /admin/maintenance/migrations/run` → opens a confirmation page showing
  the exact command, its impact and a **Run Now** button. No command runs, no
  lock is taken, no data changes.
- Clicking **Run Now** submits a CSRF-protected POST to the same URL, which is
  the only path that executes the operation (still requiring a valid
  deployment-password grant).
- Unknown slugs, cache keys or command keys in the query string are validated
  against the server-side allowlist and rejected with an error — the
  confirmation page is never rendered for unapproved operations.

Examples:

```
/admin/maintenance/migrations/run
/admin/maintenance/seeders/run?seeder=roles-and-permissions
/admin/maintenance/cache/clear?cache=config
/admin/maintenance/cache/rebuild?cache=view
/admin/maintenance/storage/link
/admin/maintenance/optimization/run?command=optimize
```

Seeder group confirmation uses `?group={group-slug}`.

---

## Required production configuration

Add to `.env` on the server (via your host's file manager — the panel never
edits or displays `.env`):

```dotenv
MAINTENANCE_PASSWORD_HASH="$2y$10$..."   # required — panel denied without it
MAINTENANCE_PANEL_ENABLED=true           # set false to emergency-disable
MAINTENANCE_REAUTH_LIFETIME=900          # seconds a re-auth grant lasts
MAINTENANCE_RATE_LIMIT=10                # requests per minute per user
```

### Configuring the deployment password securely

1. Generate a bcrypt hash **locally** (never commit the plain password):

    ```
    php -r "echo password_hash('YOUR-STRONG-PASSWORD', PASSWORD_DEFAULT);"
    ```

2. Paste the resulting hash into `MAINTENANCE_PASSWORD_HASH` in the server's
   `.env`. Only the hash is stored; the plain password never touches the
   server, the codebase, git, or the audit log.

3. Verify the panel loads: log in as a Super Administrator and open
   `/admin/maintenance`. If `MAINTENANCE_PASSWORD_HASH` is missing the panel
   refuses to run (403) instead of operating unsecured.

### Emergency disable

Set `MAINTENANCE_PANEL_ENABLED=false` in the server `.env` and save. Every
maintenance URL immediately returns 403 for everyone, regardless of role or
password. This is the fastest kill switch and requires only a file edit.

---

## Registering a new approved seeder

Seeders can **only** be executed if registered in `config/maintenance.php`:

```php
'seeders' => [
    // existing entries ...

    'my-new-seeder' => [
        'class'       => Database\Seeders\MyNewSeeder::class,
        'description' => 'What this seeder does.',
        'dangerous'   => false,
    ],
],
```

Rules:

- The browser only ever sends the **slug** (`my-new-seeder`); the class is
  resolved server-side. Arbitrary class names from the request are rejected.
- The class must exist and extend `Illuminate\Database\Seeder` — the panel
  validates this and marks invalid entries as un-runnable.
- `DatabaseSeeder` is intentionally not registered. Never register it.
- Write seeders idempotently (`updateOrCreate` / `firstOrCreate`) so they can
  be re-run safely on production.
- For a bundle, add an entry under `seeder_groups` listing member slugs in
  execution order.

After editing the config, commit and deploy via your normal GitHub Actions
FTP workflow.

---

## Post-deployment workflow (GitHub Actions → FTP)

1. **Deploy code** with your GitHub Actions FTP workflow (build assets with
   `npm run build` in CI so `public/build/manifest.json` ships, or run it
   locally and include `public/build` in the upload).
2. **Open the panel**: `/admin/maintenance` → verify the diagnostics are green
   (build manifest found, DB connected, key configured).
3. **Re-authenticate** with the deployment password (unlock window: 15 min
   by default).
4. **Run pending migrations** — _back up the database first_ (InfinityFree's
   control panel offers a database backup/export). The panel runs only
   `migrate --force`; rollback/refresh/fresh/wipe are hard-blocked.
5. **Run approved seeders** if the release added new reference data.
6. **Cache**: clear `config`, `route`, `view` caches first, then rebuild the
   ones the release needs. Route caching fails cleanly if any route uses a
   closure — clear again in that case.
7. **Storage link**: run once on a fresh deployment. On InfinityFree symlinks
   are typically blocked; the panel reports that honestly and never
   overwrites a real directory.

---

## InfinityFree limitations (do not assume — verify per feature)

- **Symlinks**: PHP `symlink()` is commonly blocked on free hosting.
  `storage:link` will report failure rather than pretend success. Safe
  alternative (no private files exposed): in the file manager, create the
  folder `public/storage` and upload only the _public_ subfolders of
  `storage/app/public` (e.g. uploaded student documents that must be served).
  Files in `storage/app/private` or other non-public storage must never be
  copied into `public/`.
- **Database**: phpMyAdmin access only; create backups via the control panel
  (or the panel's diagnostics to confirm connectivity) before migrations.
- **PHP execution time / memory**: shared hosting typically limits requests
  to tens of seconds. A large pending migration set may be cut off mid-run —
  the panel reports failure if it cannot complete, and migrations are
  resumable (already-run migrations are skipped), so re-run after a timeout.
- **File permissions / writability**: check the Storage page. If a directory
  is not writable, raise a support ticket rather than chmod 777.
- **Lock manager**: `Cache::lock()` is unavailable on the file/array stores;
  the panel uses a portable `Cache::add` spinlock that works everywhere.

---

## Security model summary

- Access requires: authenticated session **and** the `Super Administrator`
  Spatie role (existing role — no new roles/permissions created) **and** the
  panel being enabled **and** `MAINTENANCE_PASSWORD_HASH` configured.
- Sensitive POST operations additionally require a fresh password grant
  (session-based, expires after `MAINTENANCE_REAUTH_LIFETIME` seconds).
- Per-user rate limiting (`maintenance.rate_limit`) on every route.
- One mutating operation at a time via a concurrency lock with a 120 s TTL,
  always released in `finally`.
- All Artisan commands are hardcoded allowlist entries; forbidden commands
  (`migrate:fresh`, `migrate:rollback`, `db:wipe`, …) are blocked even if
  config is tampered with.
- Audit logs store actor, action, target, result, sanitized output and IP —
  never passwords, credentials, stack traces or environment values.
- Output is sanitized (secrets redacted, absolute paths masked, truncated)
  before reaching the UI or the log.

## Tests

`tests/Feature/MaintenancePanelTest.php` covers: guest/role denial,
disabled panel, missing password config, reauth required/invalid/valid,
password never logged, GET-confirmation pages rendering without executing
(no audit entries created), unknown slug/key rejection on GET and POST,
approved seeder execution + audit, approved-only POST execution,
history access control, and rate limiting (21 tests, 145 assertions).

## Migration note

The audit log table (`maintenance_logs`) ships as a normal migration. Run
`php artisan migrate` locally before deploying, or let the panel's
"Run pending migrations" action create it on the server. Until that
migration has run, the history feature simply shows an empty table.
