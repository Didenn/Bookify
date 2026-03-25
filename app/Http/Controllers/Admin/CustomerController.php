<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    private function onlineWindowSeconds(): int
    {
        return (int) env('CUSTOMER_ONLINE_WINDOW_SECONDS', 300);
    }

    public function index(Request $request)
    {
        $windowSeconds = $this->onlineWindowSeconds();
        $now = now()->timestamp;

        $customers = User::query()
            ->where('role', 'customer')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(function (User $u) use ($windowSeconds, $now) {
                $lastActivity = DB::table('sessions')
                    ->where('user_id', $u->id)
                    ->max('last_activity');

                $online = $lastActivity ? ((int) $lastActivity >= ($now - $windowSeconds)) : false;

                $totalPurchases = Order::query()->where('user_id', $u->id)->count();
                $totalSpent = (int) (Order::query()->where('user_id', $u->id)->sum('total') ?? 0);

                $productsBought = (int) (DB::table('order_items')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->where('orders.user_id', $u->id)
                    ->sum('order_items.quantity') ?? 0);

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'registeredAt' => optional($u->created_at)->format('Y-m-d H:i'),
                    'online' => $online,
                    'lastSeenAt' => $lastActivity ? date('Y-m-d H:i', (int) $lastActivity) : null,
                    'summary' => [
                        'totalPurchases' => $totalPurchases,
                        'totalSpent' => $totalSpent,
                        'productsBought' => $productsBought,
                    ],
                ];
            })
            ->values();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'onlineWindowSeconds' => $windowSeconds,
        ]);
    }

    public function show(Request $request, int $userId)
    {
        $windowSeconds = $this->onlineWindowSeconds();
        $now = now()->timestamp;

        $user = User::query()
            ->where('role', 'customer')
            ->where('id', $userId)
            ->first(['id', 'name', 'email', 'created_at']);

        if (!$user) {
            return Inertia::render('Admin/Customers/Show', [
                'customer' => null,
                'orders' => [],
            ]);
        }

        $lastActivity = DB::table('sessions')
            ->where('user_id', $user->id)
            ->max('last_activity');

        $online = $lastActivity ? ((int) $lastActivity >= ($now - $windowSeconds)) : false;

        $totalPurchases = Order::query()->where('user_id', $user->id)->count();
        $totalSpent = (int) (Order::query()->where('user_id', $user->id)->sum('total') ?? 0);
        $productsBought = (int) (DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.user_id', $user->id)
            ->sum('order_items.quantity') ?? 0);

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items.product:id,title'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'total', 'status', 'created_at'])
            ->map(function (Order $o) {
                $products = $o->items
                    ->map(function ($item) {
                        return [
                            'id' => $item->product_id,
                            'title' => $item->product?->title,
                            'quantity' => $item->quantity,
                        ];
                    })
                    ->values();

                return [
                    'id' => $o->id,
                    'total' => (int) ($o->total ?? 0),
                    'status' => $o->status,
                    'createdAt' => optional($o->created_at)->format('Y-m-d H:i'),
                    'products' => $products,
                ];
            })
            ->values();

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'registeredAt' => optional($user->created_at)->format('Y-m-d H:i'),
                'online' => $online,
                'lastSeenAt' => $lastActivity ? date('Y-m-d H:i', (int) $lastActivity) : null,
                'summary' => [
                    'totalPurchases' => $totalPurchases,
                    'totalSpent' => $totalSpent,
                    'productsBought' => $productsBought,
                ],
            ],
            'orders' => $orders,
            'onlineWindowSeconds' => $windowSeconds,
        ]);
    }
}

