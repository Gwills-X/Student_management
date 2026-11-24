<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SetupSuperAdmin extends Command
{
    protected $signature = 'school:setup';

    protected $description = 'Create the initial Super Administrator account interactively. '
                           . 'Run once after a fresh installation.';

    public function handle(): int
    {
        $this->info('');
        $this->info('═══════════════════════════════════════════════════════');
        $this->info('  School Management System — Super Administrator Setup');
        $this->info('═══════════════════════════════════════════════════════');
        $this->info('');

        // ── Duplicate guard ────────────────────────────────────────────────
        $superAdmins = User::role('Super Administrator')->count();

        if ($superAdmins > 0) {
            $this->error('A Super Administrator account already exists.');
            $this->line('No additional initial administrators will be created by this command.');
            $this->info('');
            return self::FAILURE;
        }

        // ── Collect name ───────────────────────────────────────────────────
        $name = $this->ask('Full name');

        if (blank($name)) {
            $this->error('Name cannot be empty.');
            return self::FAILURE;
        }

        // ── Collect username ───────────────────────────────────────────────
        $username = $this->ask('Username (used for login — letters, numbers, underscores)');

        if (blank($username)) {
            $this->error('Username cannot be empty.');
            return self::FAILURE;
        }

        if (! preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            $this->error('Username may only contain letters, numbers and underscores.');
            return self::FAILURE;
        }

        $username = Str::lower($username);

        if (User::where('username', $username)->exists()) {
            $this->error("Username '{$username}' is already taken.");
            return self::FAILURE;
        }

        // ── Collect email (optional) ───────────────────────────────────────
        $email = $this->ask('Email address (optional — press Enter to skip)');

        if (! blank($email)) {
            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->error('The email address is not valid.');
                return self::FAILURE;
            }

            if (User::where('email', $email)->exists()) {
                $this->error("Email '{$email}' is already in use.");
                return self::FAILURE;
            }
        }

        // ── Collect password ───────────────────────────────────────────────
        $password = $this->secret('Password (min 8 characters, not shown)');

        if (blank($password) || strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return self::FAILURE;
        }

        $confirm = $this->secret('Confirm password');

        if ($password !== $confirm) {
            $this->error('Passwords do not match.');
            return self::FAILURE;
        }

        // ── Create user and assign role ────────────────────────────────────
        DB::transaction(function () use ($name, $username, $email, $password) {
            $user = User::create([
                'name'      => $name,
                'username'  => $username,
                'email'     => blank($email) ? null : $email,
                'password'  => $password,   // 'hashed' cast auto-bcrypts
                'is_active' => true,
            ]);

            $user->assignRole('Super Administrator');

            $this->info('');
            $this->info('✓ Super Administrator account created successfully.');
            $this->table(
                ['Field', 'Value'],
                [
                    ['Name',     $name],
                    ['Username', $username],
                    ['Email',    blank($email) ? '(none)' : $email],
                    ['Role',     'Super Administrator'],
                ]
            );
            $this->info('');
        });

        return self::SUCCESS;
    }
}
