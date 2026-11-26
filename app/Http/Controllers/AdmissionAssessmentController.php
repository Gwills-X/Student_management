<?php

namespace App\Http\Controllers;

use App\Models\AdmissionApplication;
use App\Models\AdmissionAssessment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdmissionAssessmentController extends Controller
{
    public function store(Request $request, AdmissionApplication $application): RedirectResponse
    {
        $this->authorize('assess', $application);

        $validated = $request->validate([
            'assessment_type' => ['required', 'string', 'max:100'],
            'assessment_date' => ['required', 'date'],
            'score' => ['nullable', 'numeric', 'min:0'],
            'maximum_score' => ['nullable', 'numeric', 'min:0', 'gte:0'],
            'outcome' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:3000'],
            'status' => ['required', 'in:Pending,Completed,Cancelled'],
        ]);

        if ($validated['maximum_score'] !== null && $validated['score'] !== null &&
            (float) $validated['score'] > (float) $validated['maximum_score']) {
            return back()->withErrors(['score' => 'Score cannot be greater than the maximum score.']);
        }

        AdmissionAssessment::create(array_merge($validated, [
            'admission_application_id' => $application->id,
            'assessor_id' => $request->user()->id,
        ]));

        return back()->with('success', 'Assessment recorded successfully.');
    }

    public function destroy(AdmissionApplication $application, AdmissionAssessment $assessment): RedirectResponse
    {
        $this->authorize('assess', $application);

        if ($assessment->admission_application_id !== $application->id) {
            abort(404);
        }

        $assessment->delete();

        return back()->with('success', 'Assessment removed successfully.');
    }
}
