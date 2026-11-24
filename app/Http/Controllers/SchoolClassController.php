<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SchoolClassController extends Controller
{
    /**
     * Display a listing of classes.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SchoolClass::class);

        $sessions = AcademicSession::orderByDesc('start_date')->get();
        $currentSession = AcademicSession::where('is_current', true)->first() ?? $sessions->first();

        $selectedSessionId = $request->input('session_id', $currentSession?->id);
        $stageId = $request->input('stage_id');
        $levelId = $request->input('level_id');
        $search = $request->input('search');

        $classes = SchoolClass::query()
            ->with(['classLevel.stage', 'session'])
            ->withCount('subjects')
            ->when($selectedSessionId, fn ($q) => $q->where('academic_session_id', $selectedSessionId))
            ->when($levelId, fn ($q) => $q->where('class_level_id', $levelId))
            ->when($stageId, fn ($q) => $q->whereHas('classLevel', fn ($sq) => $sq->where('education_stage_id', $stageId)))
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('arm', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $stages = EducationStage::where('is_active', true)->with('classLevels')->orderBy('display_order')->get();
        $classLevels = ClassLevel::where('is_active', true)->orderBy('progression_order')->get();

        return Inertia::render('Academic/Classes/Index', [
            'classes' => $classes,
            'sessions' => $sessions,
            'selectedSessionId' => (int) $selectedSessionId,
            'stages' => $stages,
            'classLevels' => $classLevels,
            'filters' => [
                'session_id' => $selectedSessionId,
                'stage_id' => $stageId,
                'level_id' => $levelId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show form for creating a new class arm.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', SchoolClass::class);

        $sessions = AcademicSession::orderByDesc('start_date')->get();
        $currentSession = AcademicSession::where('is_current', true)->first() ?? $sessions->first();
        $classLevels = ClassLevel::where('is_active', true)
            ->with('stage')
            ->orderBy('progression_order')
            ->get();

        return Inertia::render('Academic/Classes/Create', [
            'sessions' => $sessions,
            'defaultSessionId' => $currentSession?->id,
            'classLevels' => $classLevels,
            'suggestedArms' => ['A', 'B', 'C', 'D', 'Gold', 'Diamond', 'Silver'],
        ]);
    }

    /**
     * Store a newly created class in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', SchoolClass::class);

        $validated = $request->validate([
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'class_level_id' => ['required', 'exists:class_levels,id'],
            'arm' => ['nullable', 'string', 'max:30'],
            'name' => ['nullable', 'string', 'max:100'],
            'classroom' => ['nullable', 'string', 'max:100'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
            'is_active' => ['boolean'],
        ]);

        $classLevel = ClassLevel::findOrFail($validated['class_level_id']);

        // Determine arm (trim and nullify if blank)
        $arm = ! empty($validated['arm']) ? trim($validated['arm']) : null;

        // Determine final class name
        if (! empty($validated['name'])) {
            $name = trim($validated['name']);
        } else {
            if ($arm !== null && $arm !== '') {
                $separator = (strlen($arm) === 1 && ctype_alpha($arm)) ? '' : ' ';
                $name = "{$classLevel->name}{$separator}{$arm}";
            } else {
                $name = $classLevel->name;
            }
        }

        // Enforce uniqueness of class name within the academic session
        $nameExists = SchoolClass::where('academic_session_id', $validated['academic_session_id'])
            ->where('name', $name)
            ->exists();

        if ($nameExists) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'name' => "A class named '{$name}' already exists in this academic session.",
            ]);
        }

        $schoolClass = SchoolClass::create([
            'academic_session_id' => $validated['academic_session_id'],
            'class_level_id' => $validated['class_level_id'],
            'arm' => $arm,
            'name' => $name,
            'classroom' => $validated['classroom'] ?? null,
            'capacity' => $validated['capacity'] ?? 35,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('academic.classes.show', $schoolClass)
            ->with('success', "Class {$schoolClass->name} created successfully.");
    }

    /**
     * Display class details and its assigned subjects.
     */
    public function show(SchoolClass $class): Response
    {
        $this->authorize('view', $class);

        $class->load([
            'session',
            'classLevel.stage',
            'subjects.stages',
            'classSubjects.subject.stages',
        ]);

        // Available active subjects that are mapped to this class level's stage
        $stageId = $class->classLevel->education_stage_id;
        $availableSubjects = Subject::where('is_active', true)
            ->whereHas('stages', fn ($q) => $q->where('education_stages.id', $stageId))
            ->orderBy('name')
            ->get();

        return Inertia::render('Academic/Classes/Show', [
            'schoolClass' => $class,
            'availableSubjects' => $availableSubjects,
        ]);
    }

    /**
     * Update the specified class.
     */
    public function update(Request $request, SchoolClass $class): RedirectResponse
    {
        $this->authorize('update', $class);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('classes')
                    ->where('academic_session_id', $class->academic_session_id)
                    ->ignore($class->id),
            ],
            'arm' => ['nullable', 'string', 'max:30'],
            'classroom' => ['nullable', 'string', 'max:100'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
            'is_active' => ['boolean'],
        ]);

        $validated['arm'] = ! empty($validated['arm']) ? trim($validated['arm']) : null;

        $class->update($validated);

        return back()->with('success', "Class {$class->name} updated successfully.");
    }

    /**
     * Remove the specified class.
     */
    public function destroy(SchoolClass $class): RedirectResponse
    {
        $this->authorize('delete', $class);

        $name = $class->name;
        $class->delete();

        return redirect()->route('academic.classes.index')
            ->with('success', "Class {$name} deleted successfully.");
    }
}
