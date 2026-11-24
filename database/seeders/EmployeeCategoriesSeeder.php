<?php

namespace Database\Seeders;

use App\Models\EmployeeCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EmployeeCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Teaching Staff',
                'description' => 'Academic personnel directly involved in classroom instruction, curriculum delivery, and student assessment.',
            ],
            [
                'name' => 'Administrative Staff',
                'description' => 'Personnel responsible for day-to-day school administration, records, communications, and institutional support.',
            ],
            [
                'name' => 'Accounting Staff',
                'description' => 'Finance and bursary personnel overseeing school fees, payroll, budgeting, and financial reporting.',
            ],
            [
                'name' => 'Library Staff',
                'description' => 'Librarians and learning resource managers supporting instructional media and research facilities.',
            ],
            [
                'name' => 'Examination Staff',
                'description' => 'Staff coordinating internal and external examinations, continuous assessment records, and report generation.',
            ],
            [
                'name' => 'Support Staff',
                'description' => 'Maintenance, security, laboratory assistance, driver, and facility management personnel.',
            ],
            [
                'name' => 'Other',
                'description' => 'Specialized, auxiliary, or consulting personnel not categorized elsewhere.',
            ],
        ];

        foreach ($categories as $category) {
            EmployeeCategory::firstOrCreate(
                ['name' => $category['name']],
                [
                    'slug' => Str::slug($category['name']),
                    'description' => $category['description'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Employee categories seeded successfully.');
    }
}
