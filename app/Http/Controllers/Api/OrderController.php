<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'payment_method' => 'required|string',
            'total' => 'required|numeric',
        ]);

        $orderId = (string) Str::uuid();

        $order = Order::create([
            'id' => $orderId,
            'user_id' => $request->user()->id,
            'total' => $request->total,
            'payment_method' => $request->payment_method,
            'customer_name' => $request->name,
            'customer_email' => $request->email,
            'customer_phone' => $request->number,
            'status' => 'completed',
        ]);

        foreach ($request->items as $item) {
            OrderItem::create([
                'id' => (string) Str::uuid(),
                'order_id' => $order->id,
                'product_id' => $item['id'],
                'price' => $item['price'],
                'quantity' => 1,
            ]);
        }

        return response()->json(['order' => $order, 'message' => 'Order placed successfully']);
    }

    public function library(Request $request)
    {
        $user = $request->user();
        
        $purchasedProductIds = OrderItem::whereHas('order', function($q) use ($user) {
            $q->where('user_id', $user->id)->where('status', 'completed');
        })->pluck('product_id')->unique();

        $products = \App\Models\Product::whereIn('id', $purchasedProductIds)
            ->with('category')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'type' => $p->type,
                    'category' => $p->category ? $p->category->name : 'Unknown',
                    'price' => $p->price,
                    'description' => $p->description,
                    'image' => $p->thumbnail_path ? asset('storage/' . $p->thumbnail_path) : null,
                    'file' => $p->delivery_type === 'FILE' && $p->upload_file_name ? '/api/products/' . $p->id . '/download' : null,
                    'link' => $p->delivery_type === 'LINK' ? $p->file_link : null,
                ];
            });

        return response()->json($products);
    }

    public function downloadPurchasedFile(Request $request, string $productId): StreamedResponse
    {
        $user = $request->user();

        $hasPurchased = OrderItem::query()
            ->where('product_id', $productId)
            ->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('status', 'completed');
            })
            ->exists();

        if (! $hasPurchased) {
            abort(403);
        }

        $product = Product::query()->where('id', $productId)->firstOrFail(['id', 'delivery_type', 'upload_file_name', 'title']);
        if ($product->delivery_type !== 'FILE' || empty($product->upload_file_name)) {
            abort(404);
        }

        // upload_file_name stores the full relative path (e.g. "product_files/abc.pdf").
        // Use it directly — no need to reconstruct the folder prefix.
        $path = ltrim($product->upload_file_name, '/');
        if (! Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->download($path, $product->title . '.' . pathinfo($product->upload_file_name, PATHINFO_EXTENSION));
    }
}
