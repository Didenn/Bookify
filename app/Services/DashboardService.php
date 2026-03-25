<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    public function getMetrics()
    {
        return [
            'totalProducts' => Product::count(),
            'totalUsers' => User::where('role', 'customer')->count(),
            'weeklyAddedProducts' => Product::where('created_at', '>=', now()->subDays(7))->count(),
            'totalTransactions' => Order::count(),
            'totalSales' => Order::where('status', 'completed')->sum('total'),
            'completedOrders' => Order::where('status', 'completed')->count(),
        ];
    }

    public function getRecentProductsAdded($limit = 3)
    {
        return Product::with(['category:id,name'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'title', 'delivery_type', 'created_at', 'updated_at', 'category_id'])
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'deliveryType' => $p->delivery_type,
                    'category' => $p->category?->name,
                    'createdAt' => optional($p->created_at)->format('Y-m-d H:i'),
                    'updatedAt' => optional($p->updated_at)->format('Y-m-d H:i'),
                ];
            });
    }

    public function getRecentlyEditedProducts($limit = 4)
    {
        return Product::with(['category:id,name'])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get(['id', 'title', 'delivery_type', 'created_at', 'updated_at', 'category_id'])
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'deliveryType' => $p->delivery_type,
                    'category' => $p->category?->name,
                    'createdAt' => optional($p->created_at)->format('Y-m-d H:i'),
                    'updatedAt' => optional($p->updated_at)->format('Y-m-d H:i'),
                ];
            });
    }

    public function getTypeBreakdown()
    {
        return [
            'LINK' => Product::where('delivery_type', 'LINK')->count(),
            'FILE' => Product::where('delivery_type', 'FILE')->count(),
        ];
    }

    public function getRecentOrders($limit = 5)
    {
        return Order::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($o) {
                return [
                    'id' => $o->id,
                    'referenceId' => $o->id,
                    'customer' => $o->customer_name ?: optional($o->user)->name,
                    'product' => 'Order item(s)', // Alternatively, fetch first item
                    'status' => $o->status,
                ];
            });
    }

    public function getRecentCustomers($limit = 3)
    {
        return User::where('role', 'customer')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'status' => 'active',
                ];
            });
    }

    public function getWeeklyChartForProducts()
    {
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayName = $date->format('D'); // Mon, Tue
            
            $count = Product::whereDate('created_at', $date->toDateString())->count();
            
            $days[] = [
                'label' => $dayName,
                'value' => $count,
            ];
        }
        return $days;
    }
}
