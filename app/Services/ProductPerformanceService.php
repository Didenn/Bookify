<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductPerformanceService
{
    /**
     * Get base query matching products with completed orders & order items
     * Using LEFT JOIN to ensure products with 0 sales are included.
     */
    protected function getPerformanceQuery()
    {
        return Product::select(
            'products.id',
            'products.title as name',
            DB::raw('COALESCE(SUM(order_items.quantity), 0) as total_sold'),
            DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as total_revenue')
        )
        ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
        ->leftJoin('orders', function ($join) {
            $join->on('order_items.order_id', '=', 'orders.id')
                 ->where('orders.status', '=', 'completed');
        })
        ->groupBy('products.id', 'products.title');
    }

    public function getTopSellingProducts($limit = 6)
    {
        return $this->getPerformanceQuery()
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();
    }

    public function getLeastSellingProducts($limit = 6)
    {
        return $this->getPerformanceQuery()
            ->orderBy('total_sold', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getTopRevenueProducts($limit = 6)
    {
        return $this->getPerformanceQuery()
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();
    }
}
