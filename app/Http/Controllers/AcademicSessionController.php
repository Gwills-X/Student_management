<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AcademicSessionController extends Controller
{
    /**
     * Display a listing of academic sessions.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AcademicSession::class);

        $sessions = AcademicSession::query()
            ->withCount(['terms', 'classes'])
            ->latest('start_date')
            ->get();

        $currentSession = AcademicSession::with(['terms'])->where('is_current', true)->first();

        return Inertia::render('Academic/Sessions/Index', [
            'sessions' => $sessions,
            'currentSession' => $currentSession,
        ]);
    }

    /**
     * Store a newly created academic session.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', AcademicSession::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:academic_sessions,name'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_current' => ['boolean'],
            'status' => ['required', 'string', 'in:upcoming,active,completed,Upcoming,Active,Completed'],
        ]);

        $session = AcademicSession::create([
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'description' => $validated['description'] ?? null,
            'status' => strtolower($validated['status']),
            'is_current' => false, // Handled via makeCurrent if requested
        ]);

        if ($request->boolean('is_current')) {
            $session->makeCurrent();
        }

        return redirect()->route('academic.sessions.show', $session)
            ->with('success', "Academic session {$session->name} created successfully.");
    }

    /**
     * Display the specified academic session with its terms and classes.
     */
    public function show(AcademicSession $session): Response
    {
        $this->authorize('view', $session);

        $session->load([
            'terms' => fn ($q) => $q->orderBy('term_order'),
            'classes' => fn ($q) => $q->with(['classLevel.stage'])->withCount('subjects')->orderBy('name'),
        ]);

        return Inertia::render('Academic/Sessions/Show', [
            'session' => $session,
        ]);
    }

    /**
     * Update the specified academic session.
     */
    public function update(Request $request, AcademicSession $session): RedirectResponse
    {
        $this->authorize('update', $session);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', Rule::unique('academic_sessions', 'name')->ignore($session->id)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', 'string', 'in:upcoming,active,completed,Upcoming,Active,Completed'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['status'] = strtolower($validated['status']);
        $session->update($validated);

        return back()->with('success', "Academic session {$session->name} updated successfully.");
    }

    /**
     * Set this session as the active current session across the school.
     */
    public function makeCurrent(AcademicSession $session): RedirectResponse
    {
        $this->authorize('activate', $session);

        $session->makeCurrent();

        return back()->with('success', "Session {$session->name} is now the active current academic session.");
    }

    /**
     * Remove the specified academic session from storage.
     */
    public function destroy(AcademicSession $session): RedirectResponse
    {
        $this->authorize('delete', $session);

        if ($session->hasReferences()) {
            return back()->with('error', 'Cannot delete this session because terms or classes are attached to it. Please archive or mark it as completed instead.');
        }

        if ($session->is_current) {
            return back()->with('error', 'Cannot delete the current active academic session.');
        }

        $name = $session->name;
        $session->delete();

        return redirect()->route('academic.sessions.index')
            ->with('success', "Academic session {$name} deleted successfully.");
    }
}
