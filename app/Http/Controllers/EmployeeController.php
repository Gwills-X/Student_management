<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\EmployeeCategory;
use App\Models\User;
use App\Services\EmployeeNumberGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the employees with search and filters.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);

        $filters = $request->only([
            'search',
            'category_id',
            'employment_status',
            'employment_type',
            'job_title',
            'account_status',
        ]);

        $employees = Employee::query()
            ->with(['category:id,name', 'user:id,username,name,is_active'])
            ->filter($filters)
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $categories = EmployeeCategory::where('is_active', true)->select('id', 'name')->get();

        // High-level statistics for directory header
        $stats = [
            'total' => Employee::count(),
            'active' => Employee::where('employment_status', 'Active')->count(),
            'on_leave' => Employee::where('employment_status', 'On Leave')->count(),
            'with_account' => Employee::whereNotNull('user_id')->count(),
            'teaching' => Employee::whereHas('category', fn ($q) => $q->where('name', 'Teaching Staff'))->count(),
            'non_teaching' => Employee::whereHas('category', fn ($q) => $q->where('name', '!=', 'Teaching Staff'))->count(),
        ];

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'filters' => $filters,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function create(): Response
    {
        $this->authorize('create', Employee::class);

        $categories = EmployeeCategory::where('is_active', true)->get();

        $user = auth()->user();
        $rolesQuery = Role::query();
        if (! $user->hasRole('Super Administrator')) {
            $rolesQuery->where('name', '!=', 'Super Administrator');
        }
        $availableRoles = $rolesQuery->pluck('name');

        return Inertia::render('Employees/Create', [
            'categories' => $categories,
            'availableRoles' => $availableRoles,
            'employmentTypes' => ['Full-time', 'Part-time', 'Contract', 'Probation', 'Temporary'],
            'employmentStatuses' => ['Active', 'On Leave', 'Suspended', 'Retired', 'Resigned', 'Terminated'],
            'genders' => ['Male', 'Female', 'Other'],
        ]);
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $employee = DB::transaction(function () use ($request, $validated) {
            // 1. Generate unique, concurrency-safe employee number
            $employeeNumber = EmployeeNumberGenerator::generate();

            // 2. Handle profile photo upload if provided
            $photoPath = null;
            if ($request->hasFile('profile_photo')) {
                $photoPath = $request->file('profile_photo')->store('profile_photos', 'public');
            }

            // 3. Optional User account creation
            $userId = null;
            if ($request->boolean('create_account')) {
                // Security: ordinary administrators cannot grant 'Super Administrator'
                $role = $validated['account_role'];
                if ($role === 'Super Administrator' && ! auth()->user()->hasRole('Super Administrator')) {
                    abort(403, 'Unauthorized to assign Super Administrator role.');
                }

                $user = User::create([
                    'name' => trim("{$validated['first_name']} {$validated['last_name']}"),
                    'username' => $validated['account_username'],
                    'email' => ! empty($validated['email']) ? $validated['email'] : null,
                    'password' => $validated['account_password'],
                    'is_active' => $request->boolean('account_is_active', true),
                ]);

                $user->assignRole($role);
                $userId = $user->id;
            }

            // 4. Create Employee record
            return Employee::create([
                'employee_number' => $employeeNumber,
                'user_id' => $userId,
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'profile_photo_path' => $photoPath,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'state_of_origin' => $validated['state_of_origin'] ?? null,
                'lga' => $validated['lga'] ?? null,
                'phone_number' => $validated['phone_number'],
                'alt_phone_number' => $validated['alt_phone_number'] ?? null,
                'email' => $validated['email'] ?? null,
                'residential_address' => $validated['residential_address'],
                'employee_category_id' => $validated['employee_category_id'],
                'job_title' => $validated['job_title'],
                'department' => $validated['department'] ?? null,
                'employment_type' => $validated['employment_type'],
                'date_employed' => $validated['date_employed'],
                'employment_status' => $validated['employment_status'],
                'qualifications' => $validated['qualifications'] ?? null,
                'additional_notes' => $validated['additional_notes'] ?? null,
            ]);
        });

        return redirect()->route('employees.show', $employee)
            ->with('success', "Employee {$employee->full_name} ({$employee->employee_number}) was registered successfully.");
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): Response
    {
        $this->authorize('view', $employee);

        $employee->load([
            'category',
            'user.roles',
            'documents' => fn ($q) => $q->with('uploader:id,name,username')->latest(),
        ]);

        // Available roles for account creation / editing
        $currentUser = auth()->user();
        $rolesQuery = Role::query();
        if (! $currentUser->hasRole('Super Administrator')) {
            $rolesQuery->where('name', '!=', 'Super Administrator');
        }
        $availableRoles = $rolesQuery->pluck('name');

        // Unlinked users who can be connected to this employee
        $unlinkedUsers = User::whereDoesntHave('employee')
            ->select('id', 'name', 'username', 'email')
            ->get();

        return Inertia::render('Employees/Show', [
            'employee' => $employee,
            'availableRoles' => $availableRoles,
            'unlinkedUsers' => $unlinkedUsers,
            'employmentStatuses' => ['Active', 'On Leave', 'Suspended', 'Retired', 'Resigned', 'Terminated'],
            'documentTypes' => [
                'Academic Certificate',
                'Professional Qualification',
                'Identification',
                'Employment Letter',
                'Other',
            ],
        ]);
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function edit(Employee $employee): Response
    {
        $this->authorize('update', $employee);

        $categories = EmployeeCategory::where('is_active', true)->get();

        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'categories' => $categories,
            'employmentTypes' => ['Full-time', 'Part-time', 'Contract', 'Probation', 'Temporary'],
            'employmentStatuses' => ['Active', 'On Leave', 'Suspended', 'Retired', 'Resigned', 'Terminated'],
            'genders' => ['Male', 'Female', 'Other'],
        ]);
    }

    /**
     * Update the specified employee in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validated();

        // Handle profile photo
        if ($request->boolean('remove_photo') && $employee->profile_photo_path) {
            Storage::disk('public')->delete($employee->profile_photo_path);
            $employee->profile_photo_path = null;
        } elseif ($request->hasFile('profile_photo')) {
            if ($employee->profile_photo_path) {
                Storage::disk('public')->delete($employee->profile_photo_path);
            }
            $employee->profile_photo_path = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        // Note: employee_number is deliberately excluded from update
        $employee->update([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'state_of_origin' => $validated['state_of_origin'] ?? null,
            'lga' => $validated['lga'] ?? null,
            'phone_number' => $validated['phone_number'],
            'alt_phone_number' => $validated['alt_phone_number'] ?? null,
            'email' => $validated['email'] ?? null,
            'residential_address' => $validated['residential_address'],
            'employee_category_id' => $validated['employee_category_id'],
            'job_title' => $validated['job_title'],
            'department' => $validated['department'] ?? null,
            'employment_type' => $validated['employment_type'],
            'date_employed' => $validated['date_employed'],
            'employment_status' => $validated['employment_status'],
            'qualifications' => $validated['qualifications'] ?? null,
            'additional_notes' => $validated['additional_notes'] ?? null,
        ]);

        return redirect()->route('employees.show', $employee)
            ->with('success', "Employee {$employee->full_name} details updated successfully.");
    }

    /**
     * Update employment status directly (Active, On Leave, Suspended, Retired, Resigned, Terminated).
     */
    public function updateStatus(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorize('updateStatus', $employee);

        $validated = $request->validate([
            'employment_status' => ['required', 'string', 'in:Active,On Leave,Suspended,Retired,Resigned,Terminated'],
            'status_note' => ['nullable', 'string', 'max:500'],
        ]);

        $employee->employment_status = $validated['employment_status'];

        if (! empty($validated['status_note'])) {
            $timestamp = now()->toDateTimeString();
            $newNote = "[Status changed to {$validated['employment_status']} on {$timestamp} by " . auth()->user()->name . "]: {$validated['status_note']}";
            $employee->additional_notes = $employee->additional_notes
                ? "{$newNote}\n\n" . $employee->additional_notes
                : $newNote;
        }

        $employee->save();

        return back()->with('success', "Employment status updated to {$employee->employment_status}.");
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);

        $name = $employee->full_name;

        // Delete photo if exists
        if ($employee->profile_photo_path) {
            Storage::disk('public')->delete($employee->profile_photo_path);
        }

        // Delete documents
        foreach ($employee->documents as $doc) {
            Storage::disk('local')->delete($doc->file_path);
            $doc->delete();
        }

        $employee->delete();

        return redirect()->route('employees.index')
            ->with('success', "Employee record for {$name} was deleted successfully.");
    }
}
