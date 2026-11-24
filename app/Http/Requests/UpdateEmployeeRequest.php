<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('employee'));
    }

    public function rules(): array
    {
        return [
            // Personal Details
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'in:Male,Female,Other'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
            'state_of_origin' => ['nullable', 'string', 'max:100'],
            'lga' => ['nullable', 'string', 'max:100'],

            // Contact Details
            'phone_number' => ['required', 'string', 'max:25'],
            'alt_phone_number' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'residential_address' => ['required', 'string', 'max:1000'],

            // Employment Details
            'employee_category_id' => ['required', 'exists:employee_categories,id'],
            'job_title' => ['required', 'string', 'max:150'],
            'department' => ['nullable', 'string', 'max:150'],
            'employment_type' => ['required', 'string', 'in:Full-time,Part-time,Contract,Probation,Temporary'],
            'date_employed' => ['required', 'date'],
            'employment_status' => ['required', 'string', 'in:Active,On Leave,Suspended,Retired,Resigned,Terminated'],

            // Additional
            'qualifications' => ['nullable', 'string'],
            'additional_notes' => ['nullable', 'string'],
        ];
    }
}
