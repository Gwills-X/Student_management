<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Too Many Requests</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 24px; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0f2b46 0%, #14395c 55%, #1d4d7a 100%);
        }
        .card { background: #fff; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,.35); max-width: 480px; width: 100%; padding: 40px 32px; text-align: center; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #fffbeb; color: #b45309; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 12px; }
        h1 { margin: 0; font-size: 26px; color: #111827; }
        p { margin: 10px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6; }
        a.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 28px; padding: 11px 22px; border-radius: 12px; background: #1d4ed8; color: #fff; font-weight: 600; font-size: 14px; text-decoration: none; transition: background .15s; }
        a.btn:hover { background: #1e40af; }
        .brand { margin-top: 28px; font-size: 12px; color: rgba(255,255,255,.45); }
    </style>
</head>
<body>
    <main class="card">
        <span class="badge">Error 429</span>
        <h1>Too Many Requests</h1>
        <p>Maintenance requests are rate limited for security.</p>
        <p>Please try again in {{ $retry ?? 'a few' }} seconds.</p>
        <a class="btn" href="{{ url()->previous() ?: url('/dashboard') }}">Go Back</a>
    </main>
    <footer class="brand">Greenwood Academy — School Management System</footer>
</body>
</html>
