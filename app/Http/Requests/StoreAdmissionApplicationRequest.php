<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdmissionApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('admissions.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'applicant_user_id' => ['required', 'integer', 'exists:users,id'],
            'academic_session_id' => ['required', 'integer', 'exists:academic_sessions,id'],
            'education_stage_id' => ['required', 'integer', 'exists:education_stages,id'],
            'class_level_id' => [
                'required', 'integer',
                Rule::exists('class_levels', 'id')->where(fn ($query) =>
                    $query->where('education_stage_id', $this->input('education_stage_id'))
                ),
            ],
            'application_date' => ['required', 'date'],
            'status' => ['nullable', 'in:Draft,Submitted'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'max:20'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'state_of_origin' => ['nullable', 'string', 'max:100'],
            'lga' => ['nullable', 'string', 'max:100'],
            'residential_address' => ['nullable', 'string', 'max:1000'],
            'phone_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'previous_school_name' => ['nullable', 'string', 'max:255'],
            'previous_school_address' => ['nullable', 'string', 'max:500'],
            'previous_class' => ['nullable', 'string', 'max:100'],
            'previous_academic_record' => ['nullable', 'string', 'max:2000'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_relationship' => ['nullable', 'string', 'max:100'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'guardian_address' => ['nullable', 'string', 'max:1000'],
            'remarks' => ['nullable', 'string', 'max:3000'],
        ];
    }
}
