<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request)
    {
        $start = $request->query('start', Carbon::now()->startOfMonth()->toDateString());
        $end = $request->query('end', Carbon::now()->endOfMonth()->toDateString());

        $data = $this->analyticsService->getAnalyticsData($start, $end);

        return Inertia::render('Admin/Moderator/Monitoring', [
            'analytics' => $data,
            'filters' => [
                'start' => $start,
                'end' => $end,
            ]
        ]);
    }
}
