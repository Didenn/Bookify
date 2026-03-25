<?php

use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\ProductPerformanceController;
use App\Models\Product;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Models\User;


Route::get('/create-admin', function () {
    $user = User::create([
        'name' => 'Admin',
        'email' => 'superadmin@gmail.com',
        'password' => Hash::make('12345678'),
    ]);

    return $user;
});

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

require __DIR__.'/auth.php';

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn () => redirect()->route('admin.dashboard'));

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/manage-admins', fn () => Inertia::render('Admin/ManageAdmins'))->name('manage_admins');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/{userId}', [CustomerController::class, 'show'])->name('customers.show');
    Route::get('/staff', fn () => Inertia::render('Admin/Staff/Index'))->name('staff.index');
    Route::middleware('super_admin')->group(function () {
        Route::get('/staff/data', [StaffController::class, 'index'])->name('staff.data');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::put('/staff/{user}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{user}', [StaffController::class, 'destroy'])->name('staff.destroy');
    });
    Route::get('/moderator-monitoring', [AnalyticsController::class, 'index'])->name('moderator.monitoring');
    Route::get('/moderator/products', fn () => Inertia::render('Admin/Moderator/Products/Index'))->name('moderator.products.index');
    Route::get('/moderator/product-performance', [ProductPerformanceController::class, 'index'])->name('moderator.product_performance');
    Route::get('/products', fn () => Inertia::render('Admin/Products/Index'))->name('products.index');
    Route::get('/categories', fn () => Inertia::render('Admin/Categories/Index'))->name('categories.index');

    Route::get('/products/data', [ProductController::class, 'index'])->name('products.data');

    Route::middleware('admin_or_super_admin')->group(function () {
        Route::get('/categories/data', [CategoryController::class, 'index'])->name('categories.data');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications', [NotificationController::class, 'store'])->name('notifications.store');
        Route::put('/notifications/{notification}', [NotificationController::class, 'update'])->name('notifications.update');
        Route::post('/notifications/{notification}/send', [NotificationController::class, 'send'])->name('notifications.send');
        Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    });
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{orderId}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('/notifications/data', [NotificationController::class, 'data'])->name('notifications.data');
});
