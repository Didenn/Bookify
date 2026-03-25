<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('type');
            $table->string('category_id');
            $table->unsignedInteger('price');
            $table->text('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('delivery_type');
            $table->string('file_link')->nullable();
            $table->string('upload_file_name')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnUpdate()->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
