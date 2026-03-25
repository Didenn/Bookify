<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('name')
            ->get(['id', 'name', 'status', 'created_at']);

        $data = $categories->map(fn (Category $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'status' => $c->status,
            'products' => $c->products_count,
            'created_at' => $c->created_at,
        ]);

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'string', 'max:64', Rule::unique(Category::class, 'id')],
            'name' => ['required', 'string', 'max:255', Rule::unique(Category::class, 'name')],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
        ]);

        $category = Category::create($validated);

        return response()->json([
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'status' => $category->status,
                'products' => 0,
                'created_at' => $category->created_at,
            ],
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique(Category::class, 'name')->ignore($category->id, 'id')],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
        ]);

        $category->fill($validated);
        $category->save();

        return response()->json([
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'status' => $category->status,
                'products' => $category->products()->count(),
                'created_at' => $category->created_at,
            ],
        ]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that has products.',
                'errors' => ['category' => ['Category has products.']],
            ], 422);
        }

        $category->delete();

        return response()->json(['ok' => true]);
    }
}
