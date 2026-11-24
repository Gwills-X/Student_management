<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AcademicTermController extends Controller
{
    /**
     * Store a newly created term under an academic session.
     */
    public function store(Request $request, AcademicSession $session): RedirectResponse
    {
        $this->authorize('create', AcademicTerm::class);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('academic_terms')->where('academic_session_id', $session->id),
            ],
            'term_order' => [
                'required',
                'integer',
                'between:1,10',
                Rule::unique('academic_terms')->where('academic_session_id', $session->id),
            ],
            'start_date' => [
                'required',
                'date',
                "after_or_equal:{$session->start_date}",
                "before_or_equal:{$session->end_date}",
            ],
            'end_date' => [
                'required',
                'date',
                'after:start_date',
                "before_or_equal:{$session->end_date}",
            ],
            'status' => ['required', 'string', 'in:upcoming,active,completed,Upcoming,Active,Completed'],
            'is_current' => ['boolean'],
        ], [
            'start_date.after_or_equal' => "Term start date cannot be before session start date ({$session->start_date->format('Y-m-d')}).",
            'end_date.before_or_equal' => "Term end date cannot be after session end date ({$session->end_date->format('Y-m-d')}).",
        ]);

        // Prevent overlapping term ranges within the session
        $this->assertNoOverlappingTerms($session->id, $validated['start_date'], $validated['end_date']);

        $term = $session->terms()->create([
            'name' => $validated['name'],
            'term_order' => $validated['term_order'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => strtolower($validated['status']),
            'is_current' => false,
        ]);

        if ($request->boolean('is_current')) {
            $term->makeCurrent();
        }

        return back()->with('success', "Term {$term->name} added to session {$session->name}.");
    }

    /**
     * Update the specified term.
     */
    public function update(Request $request, AcademicTerm $term): RedirectResponse
    {
        $this->authorize('update', $term);

        $session = $term->session;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('academic_terms')
                    ->where('academic_session_id', $session->id)
                    ->ignore($term->id),
            ],
            'term_order' => [
                'required',
                'integer',
                'between:1,10',
                Rule::unique('academic_terms')
                    ->where('academic_session_id', $session->id)
                    ->ignore($term->id),
            ],
            'start_date' => [
                'required',
                'date',
                "after_or_equal:{$session->start_date}",
                "before_or_equal:{$session->end_date}",
            ],
            'end_date' => [
                'required',
                'date',
                'after:start_date',
                "before_or_equal:{$session->end_date}",
            ],
            'status' => ['required', 'string', 'in:upcoming,active,completed,Upcoming,Active,Completed'],
        ], [
            'start_date.after_or_equal' => "Term start date cannot be before session start date ({$session->start_date->format('Y-m-d')}).",
            'end_date.before_or_equal' => "Term end date cannot be after session end date ({$session->end_date->format('Y-m-d')}).",
        ]);

        // Prevent overlapping term ranges within the session (excluding current term)
        $this->assertNoOverlappingTerms($session->id, $validated['start_date'], $validated['end_date'], $term->id);

        $validated['status'] = strtolower($validated['status']);
        $term->update($validated);

        return back()->with('success', "Term {$term->name} updated successfully.");
    }

    /**
     * Mark this term as the active current term across the school.
     */
    public function makeCurrent(AcademicTerm $term): RedirectResponse
    {
        $this->authorize('activate', $term);

        $term->makeCurrent();

        return back()->with('success', "{$term->name} ({$term->session->name}) is now the active current term across the school.");
    }

    /**
     * Delete an academic term.
     */
    public function destroy(AcademicTerm $term): RedirectResponse
    {
        $this->authorize('delete', $term);

        if ($term->is_current) {
            return back()->with('error', 'Cannot delete the current active academic term.');
        }

        $name = $term->name;
        $term->delete();

        return back()->with('success', "Term {$name} deleted successfully.");
    }

    /**
     * Helper to validate that term date ranges do not overlap within the same session.
     */
    protected function assertNoOverlappingTerms(int $sessionId, string $startDate, string $endDate, ?int $ignoreTermId = null): void
    {
        $overlap = AcademicTerm::where('academic_session_id', $sessionId)
            ->when($ignoreTermId, fn ($q) => $q->where('id', '!=', $ignoreTermId))
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->first();

        if ($overlap) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'start_date' => "Term date range overlaps with existing '{$overlap->name}' ({$overlap->start_date->format('Y-m-d')} to {$overlap->end_date->format('Y-m-d')}).",
            ]);
        }
    }
}
