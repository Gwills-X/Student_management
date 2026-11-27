<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Services\Maintenance\MaintenanceService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private MaintenanceService $service)
    {
    }

    public function index()
    {
        return Inertia::render('Maintenance/Index', $this->service->dashboardData());
    }

    public function diagnostics()
    {
        return Inertia::render('Maintenance/Diagnostics', $this->service->dashboardData());
    }
}
