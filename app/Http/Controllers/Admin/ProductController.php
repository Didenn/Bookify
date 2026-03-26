<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    // -------------------------------------------------------------------------
    //  Public CRUD
    // -------------------------------------------------------------------------

    public function index(): JsonResponse
    {
        $products = Product::query()
            ->with('category:id,name')
            ->orderBy('title')
            ->get(['id', 'title', 'type', 'category_id', 'price', 'description',
                   'thumbnail_path', 'delivery_type', 'file_link', 'upload_file_name', 'updated_at']);

        return response()->json(['data' => $products->map($this->serialize(...))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->buildPayload($request, null);

        $product = Product::create($data);
        $product->load('category:id,name');

        return response()->json(['data' => $this->serialize($product)], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $this->buildPayload($request, $product);

        // Delete old thumbnail if a new one was uploaded.
        if (isset($data['thumbnail_path']) && $data['thumbnail_path'] !== $product->thumbnail_path) {
            $this->deleteFile($product->thumbnail_path);
        }

        // Delete old product file if a new one was uploaded.
        if (isset($data['upload_file_name']) && $data['upload_file_name'] !== $product->upload_file_name) {
            $this->deleteFile($product->upload_file_name);
        }

        // Also delete the stored file if delivery type changed away from FILE.
        if ($data['delivery_type'] === 'LINK' && $product->upload_file_name) {
            $this->deleteFile($product->upload_file_name);
        }

        $product->fill($data)->save();
        $product->load('category:id,name');

        return response()->json(['data' => $this->serialize($product)]);
    }

    public function destroy(Product $product): JsonResponse
    {
        // Clean up stored files before deleting the record.
        $this->deleteFile($product->thumbnail_path);
        $this->deleteFile($product->upload_file_name);

        $product->delete();

        return response()->json(['ok' => true]);
    }

    // -------------------------------------------------------------------------
    //  Payload building (validate + handle uploads)
    // -------------------------------------------------------------------------

    private function buildPayload(Request $request, ?Product $product): array
    {
        $validated = $request->validate($this->rules($product));

        // Handle thumbnail upload.
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail_path'] = $this->uploadFile(
                $request->file('thumbnail'),
                'products/thumbnails'
            );
        }

        // Handle product file (PDF) upload.
        if ($request->hasFile('product_file')) {
            $validated['upload_file_name'] = $this->uploadFile(
                $request->file('product_file'),
                'product_files'
            );
        }

        // Enforce delivery type exclusivity.
        if ($validated['delivery_type'] === 'LINK') {
            $validated['upload_file_name'] = null;
        }
        if ($validated['delivery_type'] === 'FILE') {
            $validated['file_link'] = null;
        }

        // Remove the raw file inputs — they are not DB columns.
        unset($validated['thumbnail'], $validated['product_file']);

        return $validated;
    }

    private function rules(?Product $product): array
    {
        $uniqueId = $product
            ? Rule::unique(Product::class, 'id')->ignore($product->id, 'id')
            : Rule::unique(Product::class, 'id');

        return [
            'id'               => ['required', 'string', 'max:64', $uniqueId],
            'title'            => ['required', 'string', 'max:255'],
            'type'             => ['required', 'string', 'max:255'],
            'category_id'      => ['required', 'string', Rule::exists(Category::class, 'id')],
            'price'            => ['required', 'integer', 'min:0'],
            'description'      => ['nullable', 'string'],
            'delivery_type'    => ['required', Rule::in(['LINK', 'FILE'])],

            // Existing stored path (sent back by the front-end when no new file is chosen).
            'thumbnail_path'   => ['nullable', 'string', 'max:2048'],
            // New file upload (replaces any existing thumbnail_path).
            'thumbnail'        => ['nullable', 'file', 'image', 'max:4096'],

            // External URL (LINK delivery).
            'file_link'        => ['nullable', 'string', 'max:2048'],
            // New file upload (FILE delivery).
            'product_file'     => ['nullable', 'file', 'max:51200'],
        ];
    }

    // -------------------------------------------------------------------------
    //  Private helpers
    // -------------------------------------------------------------------------

    /**
     * Store an uploaded file in the public disk and return its relative path.
     * Example: "products/thumbnails/abc123.jpg"
     */
    private function uploadFile(UploadedFile $file, string $folder): string
    {
        return $file->storePublicly($folder, 'public');
    }

    /**
     * Safely delete a stored file by its relative path.
     * Does nothing if the path is blank or the file doesn't exist.
     */
    private function deleteFile(?string $relativePath): void
    {
        if ($relativePath && Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }

    /**
     * Build a full HTTPS-safe asset URL for a stored file.
     * Returns null when no path is provided.
     */
    private function storageUrl(?string $relativePath): ?string
    {
        return $relativePath ? asset('storage/' . ltrim($relativePath, '/')) : null;
    }

    // -------------------------------------------------------------------------
    //  Serialization
    // -------------------------------------------------------------------------

    private function serialize(Product $p): array
    {
        return [
            'id'             => $p->id,
            'title'          => $p->title,
            'type'           => $p->type,
            'category_id'    => $p->category_id,
            'category'       => $p->category?->name,
            'price'          => $p->price,
            'description'    => $p->description,
            'thumbnail'      => $this->storageUrl($p->thumbnail_path),
            'deliveryType'   => $p->delivery_type,
            // LINK delivery: external URL
            'fileLink'       => $p->delivery_type === 'LINK' ? $p->file_link : null,
            // FILE delivery: full HTTPS URL to the stored PDF
            'fileUrl'        => $p->delivery_type === 'FILE'
                                    ? $this->storageUrl($p->upload_file_name)
                                    : null,
            'updatedAt'      => $p->updated_at?->format('Y-m-d H:i'),
        ];
    }
}
