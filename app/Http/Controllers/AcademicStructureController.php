<?php

namespace App\Http\Controllers;

use App\Models\ClassLevel;
use App\Models\EducationStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AcademicStructureController extends Controller
{
    /**
     * Display listing of stages and class levels.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', EducationStage::class);

        $stages = EducationStage::query()
            ->with(['classLevels' => fn ($q) => $q->withCount('classes')->orderBy('progression_order')])
            ->orderBy('display_order')
            ->get();

        $canManageStages = $request->user()->hasPermissionTo('stages.manage');
        $canManageLevels = $request->user()->hasPermissionTo('class_levels.manage');

        return Inertia::render('Academic/Structure/Index', [
            'stages' => $stages,
            'can' => [
                'stages.manage'       => $canManageStages,
                'stages.edit'         => $canManageStages,
                'stages.toggle'       => $canManageStages,
                'class_levels.manage' => $canManageLevels,
                'class_levels.edit'   => $canManageLevels,
                'class_levels.toggle' => $canManageLevels,
            ],
        ]);
    }

    /**
     * Store a newly created education stage.
     */
    public function storeStage(Request $request): RedirectResponse
    {
        $this->authorize('manage', EducationStage::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:education_stages,code'],
            'description' => ['nullable', 'string', 'max:500'],
            'display_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        EducationStage::create($validated);

        return back()->with('success', "Education stage '{$validated['name']}' created successfully.");
    }

    /**
     * Update an education stage.
     */
    public function updateStage(Request $request, EducationStage $stage): RedirectResponse
    {
        $this->authorize('manage', $stage);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', Rule::unique('education_stages', 'code')->ignore($stage->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'display_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $stage->update($validated);

        return back()->with('success', "Education stage '{$stage->name}' updated successfully.");
    }

    /**
     * Toggle active status of an education stage.
     */
    public function toggleStageStatus(EducationStage $stage): RedirectResponse
    {
        $this->authorize('manage', $stage);

        $stage->is_active = ! $stage->is_active;
        $stage->save();

        $status = $stage->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Stage '{$stage->name}' {$status}.");
    }

    /**
     * Store a new class level under an education stage.
     */
    public function storeLevel(Request $request): RedirectResponse
    {
        $this->authorize('manage', ClassLevel::class);

        $validated = $request->validate([
            'education_stage_id' => ['required', 'exists:education_stages,id'],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('class_levels')->where('education_stage_id', $request->input('education_stage_id')),
            ],
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('class_levels')->where('education_stage_id', $request->input('education_stage_id')),
            ],
            'progression_order' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        ClassLevel::create($validated);

        return back()->with('success', "Class level '{$validated['name']}' created successfully.");
    }

    /**
     * Update an existing class level.
     */
    public function updateLevel(Request $request, ClassLevel $level): RedirectResponse
    {
        $this->authorize('manage', $level);

        $validated = $request->validate([
            'education_stage_id' => ['required', 'exists:education_stages,id'],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('class_levels')
                    ->where('education_stage_id', $request->input('education_stage_id'))
                    ->ignore($level->id),
            ],
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('class_levels')
                    ->where('education_stage_id', $request->input('education_stage_id'))
                    ->ignore($level->id),
            ],
            'progression_order' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $level->update($validated);

        return back()->with('success', "Class level '{$level->name}' updated successfully.");
    }

    /**
     * Toggle active status of a class level.
     */
    public function toggleLevelStatus(ClassLevel $level): RedirectResponse
    {
        $this->authorize('manage', $level);

        $level->is_active = ! $level->is_active;
        $level->save();

        $status = $level->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Class level '{$level->name}' {$status}.");
    }
}
