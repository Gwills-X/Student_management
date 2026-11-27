<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Access Denied</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0f2b46 0%, #14395c 55%, #1d4d7a 100%);
        }
        .card {
            background: #fff;
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(0,0,0,.35);
            max-width: 480px;
            width: 100%;
            padding: 40px 32px;
            text-align: center;
        }
        .icon {
            width: 64px; height: 64px; margin: 0 auto 20px;
            border-radius: 18px; background: #fef2f2;
            display: flex; align-items: center; justify-content: center;
        }
        .icon svg { width: 32px; height: 32px; stroke: #ef4444; }
        .badge {
            display: inline-block; padding: 4px 12px; border-radius: 999px;
            background: #fef2f2; color: #dc2626;
            font-size: 11px; font-weight: 700; letter-spacing: .08em;
            text-transform: uppercase; margin-bottom: 12px;
        }
        h1 { margin: 0; font-size: 26px; color: #111827; }
        p { margin: 10px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6; }
        a.btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 28px; padding: 11px 22px; border-radius: 12px;
            background: #1d4ed8; color: #fff; font-weight: 600; font-size: 14px;
            text-decoration: none; transition: background .15s;
        }
        a.btn:hover { background: #1e40af; }
        .brand { margin-top: 28px; font-size: 12px; color: rgba(255,255,255,.45); }
    </style>
</head>
<body>
    <main class="card">
        <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>
        <span class="badge">Error 403</span>
        <h1>Access Denied</h1>
        <p>{{ $message ?? 'Your account does not have the required permission to view this page.' }}</p>
        <p>If you believe you should have access, contact a system administrator.</p>
        <a class="btn" href="{{ url('/dashboard') }}">Back to Dashboard</a>
    </main>
    <footer class="brand">Greenwood Academy — School Management System</footer>
</body>
</html>
