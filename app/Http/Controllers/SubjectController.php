<?php

namespace App\Http\Controllers;

use App\Models\EducationStage;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Display a listing of subjects.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Subject::class);

        $stageId = $request->input('stage_id');
        $search = $request->input('search');
        $status = $request->input('status');

        $subjects = Subject::query()
            ->with(['stages:id,name,code'])
            ->withCount('classes')
            ->when($stageId, fn ($q) => $q->whereHas('stages', fn ($sq) => $sq->where('education_stages.id', $stageId)))
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"))
            ->when($status !== null && $status !== '', fn ($q) => $q->where('is_active', $status === 'active' || $status === '1' || $status === true))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $stages = EducationStage::where('is_active', true)->orderBy('display_order')->get();

        return Inertia::render('Academic/Subjects/Index', [
            'subjects' => $subjects,
            'stages' => $stages,
            'filters' => [
                'stage_id' => $stageId,
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created subject.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Subject::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code'],
            'description' => ['nullable', 'string', 'max:500'],
            'stages' => ['required', 'array', 'min:1'],
            'stages.*' => ['exists:education_stages,id'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $subject = Subject::create([
                'name' => $validated['name'],
                'code' => strtoupper($validated['code']),
                'description' => $validated['description'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $subject->stages()->sync($validated['stages']);
        });

        return back()->with('success', "Subject '{$validated['name']}' created successfully.");
    }

    /**
     * Display the specified subject and its assigned classes.
     */
    public function show(Subject $subject): Response
    {
        $this->authorize('view', $subject);

        $subject->load([
            'stages',
            'classes' => fn ($q) => $q->with(['session', 'classLevel.stage'])->orderBy('name'),
        ]);

        return Inertia::render('Academic/Subjects/Show', [
            'subject' => $subject,
        ]);
    }

    /**
     * Update the specified subject.
     */
    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $this->authorize('update', $subject);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subject->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'stages' => ['required', 'array', 'min:1'],
            'stages.*' => ['exists:education_stages,id'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($subject, $validated, $request) {
            $subject->update([
                'name' => $validated['name'],
                'code' => strtoupper($validated['code']),
                'description' => $validated['description'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $subject->stages()->sync($validated['stages']);
        });

        return back()->with('success', "Subject '{$subject->name}' updated successfully.");
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        $this->authorize('delete', $subject);

        if ($subject->classes()->exists()) {
            return back()->with('error', 'Cannot delete this subject because it is assigned to one or more active classes. Please remove it from classes first.');
        }

        $name = $subject->name;
        $subject->stages()->detach();
        $subject->delete();

        return redirect()->route('academic.subjects.index')
            ->with('success', "Subject '{$name}' deleted successfully.");
    }
}
