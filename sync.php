<?php

$products = \App\Models\Product::with('category')->get();
$data = [];
foreach ($products as $p) {
    if (!$p->relationLoaded('category')) {
        $p->load('category:id,name');
    }
    $thumbnailUrl = $p->thumbnail_path ? '/storage/'.ltrim($p->thumbnail_path, '/') : null;
    $data[$p->id] = [
        'id' => $p->id,
        'title' => $p->title,
        'type' => $p->type,
        'category_id' => $p->category_id,
        'category' => $p->category?->name,
        'price' => (int) $p->price,
        'description' => $p->description,
        'thumbnail' => $thumbnailUrl,
        'deliveryType' => $p->delivery_type,
        'fileLink' => $p->file_link,
        'uploadFileName' => $p->upload_file_name,
        'updatedAt' => optional($p->updated_at)->format('Y-m-d H:i'),
    ];
}

\Kreait\Laravel\Firebase\Facades\Firebase::database()->getReference('products')->set($data);
echo "Synced " . count($data) . " products to Firebase.\n";
