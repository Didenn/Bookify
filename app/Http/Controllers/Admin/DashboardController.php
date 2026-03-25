<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'productStats' => function () {
                $metrics = $this->dashboardService->getMetrics();

                return [
                    'totalProducts' => $metrics['totalProducts'],
                    'totalUsers' => $metrics['totalUsers'],
                    'weeklyAddedProducts' => $metrics['weeklyAddedProducts'],
                    'recentProductsAdded' => $this->dashboardService->getRecentProductsAdded(3),
                    'recentlyEditedProducts' => $this->dashboardService->getRecentlyEditedProducts(4),
                    'typeBreakdown' => $this->dashboardService->getTypeBreakdown(),
                ];
            },
            'dashboardData' => function () {
                $metrics = $this->dashboardService->getMetrics();
                return [
                    'transactions' => $metrics['totalTransactions'],
                    'totalSales' => $metrics['totalSales'],
                    'completed' => $metrics['completedOrders'],
                    'recentOrders' => $this->dashboardService->getRecentOrders(5),
                    'recentCustomers' => $this->dashboardService->getRecentCustomers(3),
                    'chart' => $this->dashboardService->getWeeklyChartForProducts(),
                ];
            }
        ]);
    }
}
