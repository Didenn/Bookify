<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'title' => $p->title,
                'type' => $p->type,
                'category' => $p->category ? $p->category->name : 'Unknown',
                'price' => $p->price,
                'description' => $p->description,
                'image' => $p->thumbnail_path ? asset('storage/' . $p->thumbnail_path) : null,
                'file' => null,
                'link' => $p->delivery_type === 'LINK' ? $p->file_link : null,
            ];
        });

        return response()->json($products);
    }

    public function categories()
    {
        $categories = Category::where('status', 'active')->pluck('name');
        return response()->json(['All', ...$categories]);
    }
}
