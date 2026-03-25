<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function getAnalyticsData($startString, $endString)
    {
        $start = Carbon::parse($startString)->startOfDay();
        $end = Carbon::parse($endString)->endOfDay();

        // Base query for completed orders in range
        $ordersInRange = Order::where('status', 'completed')
            ->whereBetween('created_at', [$start, $end])
            ->get(['id', 'total', 'created_at']);

        $totalRevenue = $ordersInRange->sum('total');
        $totalPurchases = $ordersInRange->count();
        $totalUsers = User::where('role', 'customer')->count();

        // Calculate Daily Sales Chart (Last 7 days from the END of the range)
        $dailyChart = [];
        $dailySalesTotal = 0; // Latest day in chart
        
        for ($i = 6; $i >= 0; $i--) {
            $date = (clone $end)->subDays($i);
            $dateString = $date->format('Y-m-d');
            $label = $date->format('m/d'); // MM/DD
            
            // Sum of orders for this specific day
            $sum = $ordersInRange->filter(function ($order) use ($dateString) {
                return Carbon::parse($order->created_at)->format('Y-m-d') === $dateString;
            })->sum('total');

            $dailyChart[] = [
                'key' => $dateString,
                'label' => $label,
                'value' => $sum,
            ];

            if ($i === 0) {
                $dailySalesTotal = $sum;
            }
        }

        $weeklySalesTotal = collect($dailyChart)->sum('value');

        // Calculate Revenue Trend (Last 6 months from the END of the range)
        $revenueTrend = [];
        $monthlySalesTotal = 0;

        for ($i = 5; $i >= 0; $i--) {
            $monthDate = (clone $end)->startOfMonth()->subMonths($i);
            $key = $monthDate->format('Y-m'); // YYYY-MM
            $label = $key;

            $sum = $ordersInRange->filter(function ($order) use ($key) {
                return Carbon::parse($order->created_at)->format('Y-m') === $key;
            })->sum('total');

            $revenueTrend[] = [
                'key' => $key,
                'label' => $label,
                'value' => $sum,
            ];

            if ($i === 0) {
                $monthlySalesTotal = $sum;
            }
        }

        // Calendar Data (Purchases grouped by day)
        $dailyRevenueMap = [];
        foreach ($ordersInRange as $order) {
            $dateKey = Carbon::parse($order->created_at)->format('Y-m-d');
            if (!isset($dailyRevenueMap[$dateKey])) {
                $dailyRevenueMap[$dateKey] = 0;
            }
            $dailyRevenueMap[$dateKey] += $order->total;
        }

        return [
            'totalRevenue' => $totalRevenue,
            'totalPurchases' => $totalPurchases,
            'totalUsers' => $totalUsers,
            'dailySalesTotal' => $dailySalesTotal,
            'weeklySalesTotal' => $weeklySalesTotal,
            'monthlySalesTotal' => $monthlySalesTotal,
            'dailyChart' => $dailyChart,
            'revenueTrend' => $revenueTrend,
            'dailyRevenueMap' => $dailyRevenueMap,
        ];
    }
}
