<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductPerformanceService;
use Inertia\Inertia;

class ProductPerformanceController extends Controller
{
    protected $performanceService;

    public function __construct(ProductPerformanceService $performanceService)
    {
        $this->performanceService = $performanceService;
    }

    public function index()
    {
        $topSellingData = $this->performanceService->getTopSellingProducts();
        $leastSellingData = $this->performanceService->getLeastSellingProducts();
        $topRevenueData = $this->performanceService->getTopRevenueProducts();

        $mapToDisplay = function ($items, $isRevenue = false) {
            return $items->map(function ($item) use ($isRevenue) {
                return [
                    'id' => $item->id,
                    'label' => $item->name,
                    'hint' => $isRevenue ? 'Revenue from completed purchases' : 'Completed purchases',
                    'value' => $isRevenue ? (float) $item->total_revenue : (int) $item->total_sold,
                ];
            });
        };

        return Inertia::render('Admin/Moderator/ProductPerformance', [
            'performanceData' => [
                'topSelling' => $mapToDisplay($topSellingData),
                'leastSelling' => $mapToDisplay($leastSellingData),
                'topRevenue' => $mapToDisplay($topRevenueData, true),
            ]
        ]);
    }
}
