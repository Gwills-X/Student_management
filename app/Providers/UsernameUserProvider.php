<?php

namespace App\Providers;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Auth\EloquentUserProvider;

/**
 * Custom user provider that locates users by the `username` column
 * rather than the default `email` column.
 *
 * We extend EloquentUserProvider so all hashing, remember-token and
 * user-retrieval logic is inherited — we only override the credential lookup.
 */
class UsernameUserProvider extends EloquentUserProvider
{
    /**
     * Retrieve a user by their credentials (username + password).
     * Password is not part of the query — it is validated separately.
     */
    public function retrieveByCredentials(array $credentials): ?Authenticatable
    {
        // Password is validated by the guard after the account is retrieved.
        $queryCredentials = array_filter(
            $credentials,
            fn ($key) => ! str_contains($key, 'password'),
            ARRAY_FILTER_USE_KEY
        );

        if (empty($queryCredentials)) {
            return null;
        }

        $query = $this->createModel()->newQuery();
        $query->where('is_active', true);

        foreach ($queryCredentials as $key => $value) {
            $query->where($key, is_string($value) ? trim($value) : $value);
        }

        return $query->first();
    }
}
