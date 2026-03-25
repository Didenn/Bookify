<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
class AdminSeeder extends Seeder
{
   
    public function run(): void
    {
        User::updateOrCreate(
        ['email' => 'superadmin@gmail.com'],
        [
            'name' => 'Super Admin',
            'password' => Hash::make('12345678'),
            'role' => 'super_admin',
        ]
    );
    }
}
