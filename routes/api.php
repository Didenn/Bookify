<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;

use App\Http\Middleware\VerifyFirebaseToken;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/categories', [ProductController::class, 'categories']);

Route::middleware([VerifyFirebaseToken::class])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/library', [OrderController::class, 'library']);

    Route::get('/products/{productId}/download', [OrderController::class, 'downloadPurchasedFile']);
});
