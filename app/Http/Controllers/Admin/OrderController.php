<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::query()
            ->with([
                'user:id,name,email',
                'items.product:id,title',
            ])
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'total', 'payment_method', 'customer_name', 'customer_email', 'status', 'created_at'])
            ->map(function (Order $order) {
                $productIds = $order->items->pluck('product_id')->filter()->values();
                $productTitles = $order->items
                    ->map(fn ($item) => $item->product?->title)
                    ->filter()
                    ->values();

                return [
                    'id' => $order->id,
                    'productReferenceId' => $productIds->count() ? $productIds->implode(', ') : '—',
                    'productName' => $productTitles->count() ? $productTitles->implode(', ') : '—',
                    'customerName' => $order->customer_name ?: ($order->user?->name ?? '—'),
                    'customerEmail' => $order->customer_email ?: ($order->user?->email ?? '—'),
                    'userId' => $order->user_id,
                    'total' => (int) ($order->total ?? 0),
                    'paymentMethod' => $order->payment_method ?: '—',
                    'date' => optional($order->created_at)->format('Y-m-d H:i'),
                ];
            })
            ->values();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(string $orderId)
    {
        $order = Order::query()
            ->with([
                'user:id,name,email',
                'items.product:id,title',
            ])
            ->where('id', $orderId)
            ->first(['id', 'user_id', 'total', 'payment_method', 'customer_name', 'customer_email', 'status', 'created_at']);

        if (!$order) {
            return Inertia::render('Admin/Orders/Show', [
                'order' => null,
            ]);
        }

        $items = $order->items->map(function ($item) {
            return [
                'productId' => $item->product_id,
                'productName' => $item->product?->title ?: '—',
                'price' => (int) ($item->price ?? 0),
                'quantity' => (int) ($item->quantity ?? 0),
            ];
        })->values();

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'customerName' => $order->customer_name ?: ($order->user?->name ?? '—'),
                'customerEmail' => $order->customer_email ?: ($order->user?->email ?? '—'),
                'userId' => $order->user_id,
                'paymentMethod' => $order->payment_method ?: '—',
                'referenceId' => $order->id,
                'total' => (int) ($order->total ?? 0),
                'date' => optional($order->created_at)->format('Y-m-d H:i'),
                'status' => $order->status,
                'items' => $items,
            ],
        ]);
    }
}

