<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$keyFile = storage_path('app/firebase-auth.json');
$creds = new \Google\Auth\Credentials\ServiceAccountCredentials(
    ['https://www.googleapis.com/auth/datastore'],
    json_decode(file_get_contents($keyFile), true)
);
$token = $creds->fetchAuthToken();
echo "Token generated: " . (isset($token['access_token']) ? "YES" : "NO") . "\n";

$projectId = json_decode(file_get_contents($keyFile), true)['project_id'];
$baseUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/products";

$response = Illuminate\Support\Facades\Http::withToken($token['access_token'])
    ->patch("{$baseUrl}/test_id_123", [
        'fields' => [
            'title' => ['stringValue' => 'Test Product'],
            'price' => ['doubleValue' => 10.99]
        ]
    ]);
echo "Status: " . $response->status() . "\n";
echo "Body: " . substr($response->body(), 0, 500) . "\n";
