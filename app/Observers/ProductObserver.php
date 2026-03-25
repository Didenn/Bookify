<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\FirebaseMessagingService;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ProductObserver
{
    private string $baseUrl = '';
    private ?string $accessToken = null;

    public function __construct(
        private readonly FirebaseMessagingService $firebaseMessagingService
    )
    {
        $keyFile = storage_path('app/firebase-auth.json');
        $projectId = env('FIREBASE_PROJECT_ID');
        
        try {
            if (file_exists($keyFile)) {
                $serviceAccount = json_decode(file_get_contents($keyFile), true);
                if (empty($projectId)) {
                    $projectId = $serviceAccount['project_id'] ?? null;
                }
                
                $creds = new ServiceAccountCredentials(
                    ['https://www.googleapis.com/auth/datastore'],
                    $serviceAccount
                );
                $token = $creds->fetchAuthToken();
                $this->accessToken = $token['access_token'] ?? null;
            } else {
                Log::error('Firebase auth file not found at: ' . $keyFile);
            }
        } catch (Exception $e) {
            Log::error('Failed to initialize Firebase Auth: ' . $e->getMessage());
        }

        if ($projectId) {
            $this->baseUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/products";
        }
    }

    public function created(Product $product): void
    {
        $this->syncToFirestore($product);
        $sent = $this->firebaseMessagingService->sendToAllUsers(
            'New Product Arrived',
            "{$product->title} is now available. Open the app to see it.",
            [
                'source' => 'product-created',
                'product_id' => $product->id,
            ]
        );

        if (!$sent) {
            Log::error('FCM auto-notification failed on product created', [
                'product_id' => $product->id,
                'title' => $product->title,
            ]);
        }
    }

    public function updated(Product $product): void
    {
        $this->syncToFirestore($product);
    }

    public function deleted(Product $product): void
    {
        if (!$this->accessToken || empty($this->baseUrl)) return;

        try {
            $response = Http::withToken($this->accessToken)
                ->delete("{$this->baseUrl}/{$product->id}");

            if ($response->failed()) {
                Log::error('Firestore sync failed on deleted: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('Firestore sync failed on deleted: ' . $e->getMessage());
        }
    }

    private function syncToFirestore(Product $product): void
    {
        if (!$this->accessToken || empty($this->baseUrl)) return;

        try {
            $fields = $this->formatForFirestore($product);

            $response = Http::withToken($this->accessToken)
                ->patch("{$this->baseUrl}/{$product->id}", [
                    'fields' => $fields
                ]);

            if ($response->failed()) {
                Log::error('Firestore sync failed: ' . $response->body());
            }
        } catch (Exception $e) {
            Log::error('Firestore sync failed: ' . $e->getMessage());
        }
    }

    private function formatForFirestore(Product $p): array
    {
        if (!$p->relationLoaded('category')) {
            $p->load('category:id,name');
        }

        $thumbnailUrl = $p->thumbnail_path ? env('APP_URL') . '/storage/'.ltrim($p->thumbnail_path, '/') : null;

        return [
            'id' => ['stringValue' => (string) $p->id],
            'title' => ['stringValue' => (string) $p->title],
            'type' => ['stringValue' => (string) $p->type],
            'category_id' => ['stringValue' => (string) $p->category_id],
            'category' => ['stringValue' => $p->category ? (string) $p->category->name : ''],
            'price' => ['doubleValue' => (float) $p->price],
            'description' => ['stringValue' => $p->description ? (string) $p->description : ''],
            'image' => ['stringValue' => $thumbnailUrl ? (string) $thumbnailUrl : ''],
            'deliveryType' => ['stringValue' => (string) $p->delivery_type],
            'fileLink' => ['stringValue' => $p->file_link ? (string) $p->file_link : ''],
            'uploadFileName' => ['stringValue' => $p->upload_file_name ? (string) $p->upload_file_name : ''],
            'updatedAt' => ['stringValue' => $p->updated_at ? \Carbon\Carbon::parse($p->updated_at)->setTimezone('UTC')->format('Y-m-d\TH:i:s\Z') : gmdate('Y-m-d\TH:i:s\Z')],
        ];
    }
}
