<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category:id,name'])
            ->orderBy('title')
            ->get([
                'id',
                'title',
                'type',
                'category_id',
                'price',
                'description',
                'thumbnail_path',
                'delivery_type',
                'file_link',
                'upload_file_name',
                'updated_at',
            ]);

        return response()->json([
            'data' => $products->map(fn (Product $p) => $this->serialize($p)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request, null);

        $product = Product::create($validated);
        $product->load('category:id,name');

        return response()->json([
            'data' => $this->serialize($product),
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $this->validatePayload($request, $product);

        $product->fill($validated);
        $product->save();
        $product->load('category:id,name');

        return response()->json([
            'data' => $this->serialize($product),
        ]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['ok' => true]);
    }

    private function validatePayload(Request $request, ?Product $product): array
    {
        $idRules = $product
            ? ['required', 'string', 'max:64', Rule::unique(Product::class, 'id')->ignore($product->id, 'id')]
            : ['required', 'string', 'max:64', Rule::unique(Product::class, 'id')];

        $rules = [
            'id' => $idRules,
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'string', Rule::exists(Category::class, 'id')],
            'price' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'thumbnail_path' => ['nullable', 'string', 'max:2048'],
            'thumbnail' => ['nullable', 'file', 'image', 'max:4096'],
            'delivery_type' => ['required', 'string', Rule::in(['LINK', 'FILE'])],
            'file_link' => ['nullable', 'string', 'max:2048'],
            'upload_file_name' => ['nullable', 'string', 'max:255'],
            'product_file' => ['nullable', 'file', 'max:51200'],
        ];

        $validated = $request->validate($rules);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->storePublicly('products/thumbnails', 'public');
            $validated['thumbnail_path'] = $path;
        }

        unset($validated['thumbnail']);

        if ($request->hasFile('product_file')) {
            $storedPath = $request->file('product_file')->storePublicly('product_files', 'public');
            // Store the full relative path (e.g. "product_files/abc.pdf") so downloads
            // can use it directly without reconstructing the folder prefix.
            $validated['upload_file_name'] = $storedPath;
        }

        unset($validated['product_file']);

        if ($validated['delivery_type'] === 'LINK') {
            $validated['upload_file_name'] = null;
        }

        if ($validated['delivery_type'] === 'FILE') {
            $validated['file_link'] = null;
        }

        return $validated;
    }

    private function serialize(Product $p): array
    {
        // Use asset() so the URL is absolute and correct in all environments (local + Railway).
        $thumbnailUrl = $p->thumbnail_path ? asset('storage/' . $p->thumbnail_path) : null;

        return [
            'id' => $p->id,
            'title' => $p->title,
            'type' => $p->type,
            'category_id' => $p->category_id,
            'category' => $p->category?->name,
            'price' => $p->price,
            'description' => $p->description,
            'thumbnail' => $thumbnailUrl,
            'deliveryType' => $p->delivery_type,
            'fileLink' => $p->file_link,
            'uploadFileName' => $p->upload_file_name,
            'updatedAt' => optional($p->updated_at)->format('Y-m-d H:i'),
        ];
    }
}
