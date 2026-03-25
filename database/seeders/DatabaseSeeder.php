<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('12345678'),
                'role' => 'super_admin',
            ],
        );

        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
            ],
        );

        User::updateOrCreate(
            ['email' => 'moderator@gmail.com'],
            [
                'name' => 'Moderator',
                'password' => Hash::make('12345678'),
                'role' => 'moderator',
            ],
        );

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'admin',
        ]);

        Category::updateOrCreate(['id' => 'C-01'], ['name' => 'PDF', 'status' => 'active']);
        Category::updateOrCreate(['id' => 'C-02'], ['name' => 'Ebook', 'status' => 'active']);
        Category::updateOrCreate(['id' => 'C-03'], ['name' => 'Word Templates', 'status' => 'active']);
        Category::updateOrCreate(['id' => 'C-04'], ['name' => 'Excel Templates', 'status' => 'active']);
        Category::updateOrCreate(['id' => 'C-05'], ['name' => 'Software Guides', 'status' => 'active']);

        Product::updateOrCreate(
            ['id' => 'bk_js_essentials'],
            [
                'title' => 'JavaScript Essentials: From Zero to Projects',
                'type' => 'Ebook',
                'category_id' => 'C-02',
                'price' => 199,
                'description' => 'A practical guide with hands-on examples and mini projects.',
                'thumbnail_path' => null,
                'delivery_type' => 'LINK',
                'file_link' => 'https://drive.google.com/',
                'upload_file_name' => null,
            ],
        );

        Product::updateOrCreate(
            ['id' => 'pdf_uiux_checklist'],
            [
                'title' => 'UI/UX Checklist for Mobile Apps',
                'type' => 'PDF Guide',
                'category_id' => 'C-01',
                'price' => 99,
                'description' => 'Improve usability with proven patterns and checklists.',
                'thumbnail_path' => null,
                'delivery_type' => 'FILE',
                'file_link' => null,
                'upload_file_name' => 'uiux-checklist.pdf',
            ],
        );

        Product::updateOrCreate(
            ['id' => 'xl_budget_planner'],
            [
                'title' => 'Student Budget Planner',
                'type' => 'Excel Template',
                'category_id' => 'C-04',
                'price' => 79,
                'description' => 'Track expenses and savings with ready-made formulas.',
                'thumbnail_path' => null,
                'delivery_type' => 'FILE',
                'file_link' => null,
                'upload_file_name' => 'budget-planner.xlsx',
            ],
        );

        Product::updateOrCreate(
            ['id' => 'wd_thesis_kit'],
            [
                'title' => 'Thesis Writing Starter Kit',
                'type' => 'Word Template',
                'category_id' => 'C-03',
                'price' => 149,
                'description' => 'Includes formatting styles, sections, and sample pages.',
                'thumbnail_path' => null,
                'delivery_type' => 'FILE',
                'file_link' => null,
                'upload_file_name' => 'thesis-kit.docx',
            ],
        );
    }
}
