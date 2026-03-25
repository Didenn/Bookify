<?php require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;

echo "Starting Firestore Sync...\n";

try {
    $keyFile = storage_path('app/firebase-auth.json');
    if (!file_exists($keyFile)) {
        die("Firebase credentials not found at {$keyFile}.\n");
    }

    $serviceAccount = json_decode(file_get_contents($keyFile), true);
    $projectId = env('FIREBASE_PROJECT_ID', $serviceAccount['project_id'] ?? null);

    if (!$projectId) {
        die("Project ID not found in credentials or env.\n");
    }

    $creds = new ServiceAccountCredentials(
        ['https://www.googleapis.com/auth/datastore'],
        $serviceAccount
    );
    $token = $creds->fetchAuthToken();
    $accessToken = $token['access_token'] ?? null;

    if (!$accessToken) {
        die("Failed to generate access token.\n");
    }

    $baseUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/products";

    $products = Product::with('category:id,name')->get();
    $count = 0;
    
    foreach ($products as $p) {
        $thumbnailUrl = $p->thumbnail_path ? env('APP_URL') . '/storage/'.ltrim($p->thumbnail_path, '/') : null;
        
        $fields = [
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

        $response = Http::withToken($accessToken)->patch("{$baseUrl}/{$p->id}", [
            'fields' => $fields
        ]);

        if ($response->successful()) {
            echo "Successfully synced: {$p->title}\n";
            $count++;
        } else {
            echo "Failed to sync {$p->title}: " . $response->body() . "\n";
        }
    }

    echo "Completed! Synced {$count} products.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
