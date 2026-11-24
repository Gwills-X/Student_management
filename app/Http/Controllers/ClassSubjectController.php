<?php

namespace App\Http\Controllers;

use App\Models\ClassSubject;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClassSubjectController extends Controller
{
    /**
     * Assign a single subject to a class.
     */
    public function store(Request $request, SchoolClass $class): RedirectResponse
    {
        $this->authorize('manageSubjects', $class);

        $validated = $request->validate([
            'subject_id' => [
                'required',
                'exists:subjects,id',
                Rule::unique('class_subjects')->where('class_id', $class->id),
            ],
        ]);

        $subject = Subject::findOrFail($validated['subject_id']);

        if (! $subject->is_active) {
            return back()->with('error', 'Cannot assign an inactive subject.');
        }

        $class->subjects()->attach($subject->id, ['is_active' => true]);

        return back()->with('success', "Subject '{$subject->name}' assigned to class {$class->name}.");
    }

    /**
     * Bulk sync subjects to a class.
     */
    public function bulkSync(Request $request, SchoolClass $class): RedirectResponse
    {
        $this->authorize('manageSubjects', $class);

        $validated = $request->validate([
            'subject_ids' => ['required', 'array'],
            'subject_ids.*' => ['exists:subjects,id'],
        ]);

        DB::transaction(function () use ($class, $validated) {
            $class->subjects()->sync($validated['subject_ids']);
        });

        return back()->with('success', "Subjects synchronized for class {$class->name}.");
    }

    /**
     * Remove an assigned subject from a class.
     */
    public function destroy(SchoolClass $class, Subject $subject): RedirectResponse
    {
        $this->authorize('manageSubjects', $class);

        $class->subjects()->detach($subject->id);

        return back()->with('success', "Subject '{$subject->name}' removed from class {$class->name}.");
    }
}
