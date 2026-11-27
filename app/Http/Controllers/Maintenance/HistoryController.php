<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $logs = MaintenanceLog::query()
            ->when($request->filled('action'), fn ($q) => $q->where('action', 'like', $request->string('action').'%'))
            ->when($request->filled('result'), fn ($q) => $q->where('success', $request->boolean('result')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Maintenance/History', [
            'logs'   => $logs,
            'filters' => $request->only(['action', 'result']),
        ]);
    }
}
