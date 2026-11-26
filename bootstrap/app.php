<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Render the branded "Access Denied" page for authorization failures.
        // The original message (which may name policies/resources) is never
        // passed to the client — only the generic status + shared auth data.
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, \Illuminate\Http\Request $request) {
            if ($request->inertia()) {
                return \Inertia\Inertia::render('AccessDenied')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied.'], 403);
            }

            return response()->view('errors.403', ['status' => 403], 403);
        });

        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, \Illuminate\Http\Request $request) {
            if ($request->inertia()) {
                return \Inertia\Inertia::render('AccessDenied')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied.'], 403);
            }

            return response()->view('errors.403', ['status' => 403], 403);
        });
    })->create();
