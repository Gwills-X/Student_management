<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeCategory;
use App\Models\EmployeeDocument;
use App\Models\User;
use App\Services\EmployeeNumberGenerator;
use Database\Seeders\EmployeeCategoriesSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class Stage2EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and categories
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(EmployeeCategoriesSeeder::class);
    }

    /**
     * Helper to create an authorized administrator.
     */
    protected function createAdmin(): User
    {
        $admin = User::factory()->create([
            'username' => 'admin_' . uniqid(),
            'is_active' => true,
        ]);
        $admin->assignRole('Administrator');

        return $admin;
    }

    /**
     * Helper to create a Super Administrator.
     */
    protected function createSuperAdmin(): User
    {
        $superAdmin = User::factory()->create([
            'username' => 'superadmin_' . uniqid(),
            'is_active' => true,
        ]);
        $superAdmin->assignRole('Super Administrator');

        return $superAdmin;
    }

    public function test_employee_number_generator_produces_sequential_formatted_numbers(): void
    {
        $year = (int) date('Y');
        $num1 = EmployeeNumberGenerator::generate($year);
        $num2 = EmployeeNumberGenerator::generate($year);

        $this->assertStringStartsWith("STAFF/{$year}/", $num1);
        $this->assertStringStartsWith("STAFF/{$year}/", $num2);
        $this->assertNotEquals($num1, $num2);

        // Sequence must increment
        $seq1 = (int) substr($num1, -4);
        $seq2 = (int) substr($num2, -4);
        $this->assertEquals($seq1 + 1, $seq2);
    }

    public function test_administrator_can_view_employee_directory(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->get(route('employees.index'));
        $response->assertOk();
    }

    public function test_unauthorized_user_cannot_view_or_create_employees(): void
    {
        $studentUser = User::factory()->create(['username' => 'student_user']);
        $studentUser->assignRole('Student');

        $this->actingAs($studentUser)->get(route('employees.index'))
            ->assertForbidden();

        $this->actingAs($studentUser)->get(route('employees.create'))
            ->assertForbidden();
    }

    public function test_administrator_can_register_employee_without_user_account(): void
    {
        $admin = $this->createAdmin();
        $category = EmployeeCategory::where('name', 'Teaching Staff')->first();

        $employeeData = [
            'first_name' => 'Chioma',
            'middle_name' => 'Grace',
            'last_name' => 'Okonkwo',
            'date_of_birth' => '1990-05-15',
            'gender' => 'Female',
            'phone_number' => '08034567890',
            'alt_phone_number' => '08098765432',
            'email' => 'chioma.okonkwo@example.com',
            'residential_address' => '12 Victoria Island Road, Lagos',
            'state_of_origin' => 'Anambra State',
            'lga' => 'Onitsha North',
            'employee_category_id' => $category->id,
            'job_title' => 'Biology Teacher',
            'department' => 'Sciences',
            'employment_type' => 'Full-time',
            'date_employed' => '2024-09-01',
            'employment_status' => 'Active',
            'qualifications' => 'B.Sc. Biology, TRCN Certified',
            'create_account' => false,
        ];

        $response = $this->actingAs($admin)->post(route('employees.store'), $employeeData);

        $this->assertDatabaseHas('employees', [
            'first_name' => 'Chioma',
            'last_name' => 'Okonkwo',
            'job_title' => 'Biology Teacher',
            'user_id' => null, // No linked account
        ]);

        $employee = Employee::where('first_name', 'Chioma')->first();
        $this->assertNotNull($employee->employee_number);
        $this->assertStringStartsWith('STAFF/', $employee->employee_number);

        $response->assertRedirect(route('employees.show', $employee));
    }

    public function test_administrator_can_register_employee_with_user_account(): void
    {
        $admin = $this->createAdmin();
        $category = EmployeeCategory::where('name', 'Teaching Staff')->first();

        $employeeData = [
            'first_name' => 'Emeka',
            'last_name' => 'Eze',
            'phone_number' => '08123456789',
            'residential_address' => '45 Independence Layout, Enugu',
            'employee_category_id' => $category->id,
            'job_title' => 'Chemistry Teacher',
            'employment_type' => 'Full-time',
            'date_employed' => '2024-09-01',
            'employment_status' => 'Active',
            'create_account' => true,
            'account_username' => 'eeze',
            'account_password' => 'SecurePass123!',
            'account_role' => 'Teacher',
            'account_is_active' => true,
        ];

        $response = $this->actingAs($admin)->post(route('employees.store'), $employeeData);

        $this->assertDatabaseHas('users', [
            'username' => 'eeze',
            'is_active' => true,
        ]);

        $user = User::where('username', 'eeze')->first();
        $this->assertTrue($user->hasRole('Teacher'));

        $this->assertDatabaseHas('employees', [
            'first_name' => 'Emeka',
            'user_id' => $user->id,
        ]);
    }

    public function test_can_create_user_account_for_existing_employee(): void
    {
        $admin = $this->createAdmin();
        $category = EmployeeCategory::first();

        $employee = Employee::create([
            'employee_number' => EmployeeNumberGenerator::generate(),
            'first_name' => 'Aisha',
            'last_name' => 'Bello',
            'phone_number' => '08022233344',
            'residential_address' => 'Wuse II, Abuja',
            'employee_category_id' => $category->id,
            'job_title' => 'School Secretary',
            'employment_type' => 'Full-time',
            'date_employed' => '2025-01-15',
            'employment_status' => 'Active',
        ]);

        $this->assertNull($employee->user_id);

        $response = $this->actingAs($admin)->post(route('employees.account.store', $employee), [
            'username' => 'abello',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'Administrator',
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');

        $employee->refresh();
        $this->assertNotNull($employee->user_id);
        $this->assertEquals('abello', $employee->user->username);
        $this->assertTrue($employee->user->hasRole('Administrator'));
    }

    public function test_can_link_and_unlink_existing_standalone_user_to_employee(): void
    {
        $admin = $this->createAdmin();
        $category = EmployeeCategory::first();

        $standaloneUser = User::factory()->create([
            'username' => 'standalone_staff',
            'is_active' => true,
        ]);

        $employee = Employee::create([
            'employee_number' => EmployeeNumberGenerator::generate(),
            'first_name' => 'Ibrahim',
            'last_name' => 'Musa',
            'phone_number' => '08055566677',
            'residential_address' => 'Kaduna Central',
            'employee_category_id' => $category->id,
            'job_title' => 'Librarian',
            'employment_type' => 'Full-time',
            'date_employed' => '2025-02-01',
            'employment_status' => 'Active',
        ]);

        // Link
        $this->actingAs($admin)->post(route('employees.account.link', $employee), [
            'user_id' => $standaloneUser->id,
        ])->assertSessionHas('success');

        $employee->refresh();
        $this->assertEquals($standaloneUser->id, $employee->user_id);

        // Unlink
        $this->actingAs($admin)->delete(route('employees.account.unlink', $employee))
            ->assertSessionHas('success');

        $employee->refresh();
        $this->assertNull($employee->user_id);
        // The standalone user must still exist!
        $this->assertDatabaseHas('users', ['id' => $standaloneUser->id]);
    }

    public function test_deactivating_user_account_does_not_delete_employee(): void
    {
        $admin = $this->createAdmin();
        $category = EmployeeCategory::first();

        $user = User::factory()->create(['username' => 'staff_active', 'is_active' => true]);
        $employee = Employee::create([
            'employee_number' => EmployeeNumberGenerator::generate(),
            'user_id' => $user->id,
            'first_name' => 'Femi',
            'last_name' => 'Adeyemi',
            'phone_number' => '08011122233',
            'residential_address' => 'Ibadan',
            'employee_category_id' => $category->id,
            'job_title' => 'Accountant',
            'employment_type' => 'Full-time',
            'date_employed' => '2025-01-01',
            'employment_status' => 'Active',
        ]);

        // Deactivate linked account
        $this->actingAs($admin)->patch(route('employees.account.toggle-active', $employee))
            ->assertSessionHas('success');

        $user->refresh();
        $employee->refresh();

        $this->assertFalse((bool) $user->is_active);
        // Employee record is completely preserved!
        $this->assertNotNull($employee->id);
        $this->assertEquals('Active', $employee->employment_status);
    }

    public function test_employment_status_can_be_updated_independently(): void
    {
        $admin = $this->createAdmin();
        $category = EmployeeCategory::first();

        $employee = Employee::create([
            'employee_number' => EmployeeNumberGenerator::generate(),
            'first_name' => 'Ngozi',
            'last_name' => 'Nwosu',
            'phone_number' => '08099988877',
            'residential_address' => 'Asaba',
            'employee_category_id' => $category->id,
            'job_title' => 'Vice Principal',
            'employment_type' => 'Full-time',
            'date_employed' => '2023-01-01',
            'employment_status' => 'Active',
        ]);

        $this->actingAs($admin)->patch(route('employees.status.update', $employee), [
            'employment_status' => 'On Leave',
            'status_note' => 'Approved 3-month research sabbatical.',
        ])->assertSessionHas('success');

        $employee->refresh();
        $this->assertEquals('On Leave', $employee->employment_status);
        $this->assertStringContainsString('research sabbatical', $employee->additional_notes);
    }

    public function test_super_administrator_account_is_protected(): void
    {
        $superAdmin = $this->createSuperAdmin();
        $regularAdmin = $this->createAdmin();

        // Regular admin CANNOT deactivate Super Administrator
        $this->actingAs($regularAdmin)->patch(route('users.toggle-status', $superAdmin))
            ->assertForbidden();

        $superAdmin->refresh();
        $this->assertTrue((bool) $superAdmin->is_active);

        // Regular admin CANNOT assign 'Super Administrator' role to anyone
        $targetUser = User::factory()->create(['username' => 'target_user']);
        $this->actingAs($regularAdmin)->put(route('users.update', $targetUser), [
            'name' => 'Target User',
            'role' => 'Super Administrator',
            'is_active' => true,
        ])->assertForbidden();
    }

    public function test_secure_document_upload_and_download(): void
    {
        Storage::fake('local');

        $admin = $this->createAdmin();
        $category = EmployeeCategory::first();

        $employee = Employee::create([
            'employee_number' => EmployeeNumberGenerator::generate(),
            'first_name' => 'David',
            'last_name' => 'Mark',
            'phone_number' => '08077788899',
            'residential_address' => 'Jos',
            'employee_category_id' => $category->id,
            'job_title' => 'Physics Teacher',
            'employment_type' => 'Full-time',
            'date_employed' => '2025-01-01',
            'employment_status' => 'Active',
        ]);

        $file = UploadedFile::fake()->create('degree_certificate.pdf', 500, 'application/pdf');

        // Upload
        $response = $this->actingAs($admin)->post(route('employees.documents.store', $employee), [
            'title' => 'B.Sc Physics Certificate',
            'document_type' => 'Academic Certificate',
            'document_file' => $file,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->id,
            'title' => 'B.Sc Physics Certificate',
            'document_type' => 'Academic Certificate',
            'file_name' => 'degree_certificate.pdf',
        ]);

        $document = EmployeeDocument::where('employee_id', $employee->id)->first();
        Storage::disk('local')->assertExists($document->file_path);

        // Download
        $downloadResponse = $this->actingAs($admin)->get(route('employees.documents.download', [$employee, $document]));
        $downloadResponse->assertOk();

        // Delete
        $this->actingAs($admin)->delete(route('employees.documents.destroy', [$employee, $document]))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('employee_documents', ['id' => $document->id]);
        Storage::disk('local')->assertMissing($document->file_path);
    }

    public function test_administrator_can_manage_user_accounts(): void
    {
        $admin = $this->createAdmin();

        // 1. View User directory
        $this->actingAs($admin)->get(route('users.index'))->assertOk();

        // 2. Create standalone user
        $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'Lab Technician',
            'username' => 'labtech01',
            'email' => 'labtech@greenwood.edu',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'Teacher',
            'is_active' => true,
        ])->assertSessionHas('success');

        $newUser = User::where('username', 'labtech01')->first();
        $this->assertNotNull($newUser);
        $this->assertTrue($newUser->hasRole('Teacher'));

        // 3. Update user role and name
        $this->actingAs($admin)->put(route('users.update', $newUser), [
            'name' => 'Senior Lab Technician',
            'role' => 'Assistant Form Master',
            'is_active' => true,
        ])->assertSessionHas('success');

        $newUser->refresh();
        $this->assertEquals('Senior Lab Technician', $newUser->name);
        $this->assertTrue($newUser->hasRole('Assistant Form Master'));

        // 4. Toggle active status
        $this->actingAs($admin)->patch(route('users.toggle-status', $newUser))
            ->assertSessionHas('success');

        $newUser->refresh();
        $this->assertFalse((bool) $newUser->is_active);

        // 5. Reset password
        $this->actingAs($admin)->post(route('users.reset-password', $newUser), [
            'password' => 'NewSecretPassword999!',
            'password_confirmation' => 'NewSecretPassword999!',
        ])->assertSessionHas('success');

        $newUser->refresh();
        $this->assertTrue(Hash::check('NewSecretPassword999!', $newUser->password));
    }
}
