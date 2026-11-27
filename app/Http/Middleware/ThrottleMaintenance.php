<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\RateLimiter;

/**
 * Per-user rate limiter for maintenance routes.
 */
class ThrottleMaintenance
{
    public function handle(Request $request, Closure $next)
    {
        $key = 'maintenance:'.($request->user()?->id ?? $request->ip());

        $maxAttempts = (int) config('maintenance.rate_limit', 10);

        $executed = RateLimiter::attempt(
            $key,
            $maxAttempts,
            fn () => true,
            60,
        );

        if (! $executed) {
            $retry = RateLimiter::availableIn($key);

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => "Too many maintenance requests. Try again in {$retry} seconds.",
                ], 429);
            }

            return response()->view('errors.429', ['retry' => $retry], 429);
        }

        return $next($request);
    }
}
