import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    Layers,
    Pencil,
    Plus,
    Power,
    School,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ stages = [] }) {
    const [addStageModalOpen, setAddStageModalOpen] = useState(false);
    const [editStageModalOpen, setEditStageModalOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);

    const [addLevelModalOpen, setAddLevelModalOpen] = useState(false);
    const [editLevelModalOpen, setEditLevelModalOpen] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [targetStageIdForLevel, setTargetStageIdForLevel] = useState(stages[0]?.id || null);

    // ── Form: Add Stage ────────────────────────────────────────────────────
    const stageForm = useForm({
        name: '',
        code: '',
        description: '',
        display_order: stages.length + 1,
        is_active: true,
    });

    function handleAddStageSubmit(e) {
        e.preventDefault();
        stageForm.post('/academic/stages', {
            onSuccess: () => {
                setAddStageModalOpen(false);
                stageForm.reset();
            },
        });
    }

    // ── Form: Edit Stage ───────────────────────────────────────────────────
    const editStageForm = useForm({
        name: '',
        code: '',
        description: '',
        display_order: 1,
        is_active: true,
    });

    function openEditStageModal(stage) {
        setSelectedStage(stage);
        editStageForm.setData({
            name: stage.name,
            code: stage.code,
            description: stage.description || '',
            display_order: stage.display_order,
            is_active: Boolean(stage.is_active),
        });
        setEditStageModalOpen(true);
    }

    function handleEditStageSubmit(e) {
        e.preventDefault();
        editStageForm.put(`/academic/stages/${selectedStage.id}`, {
            onSuccess: () => {
                setEditStageModalOpen(false);
                setSelectedStage(null);
            },
        });
    }

    function toggleStageActive(stage) {
        router.patch(`/academic/stages/${stage.id}/toggle-status`);
    }

    // ── Form: Add Level ────────────────────────────────────────────────────
    const levelForm = useForm({
        education_stage_id: '',
        name: '',
        code: '',
        progression_order: 1,
        description: '',
        is_active: true,
    });

    function openAddLevelModal(stageId) {
        setTargetStageIdForLevel(stageId);
        levelForm.setData({
            education_stage_id: stageId,
            name: '',
            code: '',
            progression_order: 1,
            description: '',
            is_active: true,
        });
        setAddLevelModalOpen(true);
    }

    function handleAddLevelSubmit(e) {
        e.preventDefault();
        levelForm.post('/academic/levels', {
            onSuccess: () => {
                setAddLevelModalOpen(false);
                levelForm.reset();
            },
        });
    }

    // ── Form: Edit Level ───────────────────────────────────────────────────
    const editLevelForm = useForm({
        education_stage_id: '',
        name: '',
        code: '',
        progression_order: 1,
        description: '',
        is_active: true,
    });

    function openEditLevelModal(level) {
        setSelectedLevel(level);
        editLevelForm.setData({
            education_stage_id: level.education_stage_id,
            name: level.name,
            code: level.code,
            progression_order: level.progression_order,
            description: level.description || '',
            is_active: Boolean(level.is_active),
        });
        setEditLevelModalOpen(true);
    }

    function handleEditLevelSubmit(e) {
        e.preventDefault();
        editLevelForm.put(`/academic/levels/${selectedLevel.id}`, {
            onSuccess: () => {
                setEditLevelModalOpen(false);
                setSelectedLevel(null);
            },
        });
    }

    function toggleLevelActive(level) {
        router.patch(`/academic/levels/${level.id}/toggle-status`);
    }

    return (
        <AuthenticatedLayout title="Education Stages &amp; Class Levels">
            <div className="max-w-7xl mx-auto space-y-6">
                <AcademicNav currentTab="structure" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Education Stages &amp; Class Levels
                        </h1>
                        <p className="text-gray-500 text-xs mt-0.5">
                            Configure school instructional stages (e.g. Primary, Junior Secondary) and progressive grade levels (e.g. JSS1, JSS2).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            stageForm.reset();
                            setAddStageModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Education Stage</span>
                    </button>
                </div>

                {/* Stages & Levels Listing */}
                <div className="space-y-6">
                    {stages.map((stage) => (
                        <div key={stage.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                            {/* Stage Header */}
                            <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs font-mono">
                                        {stage.code}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-bold text-gray-900">{stage.name}</h2>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                stage.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {stage.is_active ? 'Active Stage' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Display Order: <span className="font-semibold text-gray-800">#{stage.display_order}</span>
                                            {stage.description && <span> &bull; {stage.description}</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openAddLevelModal(stage.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold border border-primary-200 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Class Level</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEditStageModal(stage)}
                                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-200/60 transition-colors"
                                        title="Edit Stage"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleStageActive(stage)}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                            stage.is_active ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-emerald-600'
                                        }`}
                                        title={stage.is_active ? 'Deactivate Stage' : 'Activate Stage'}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Class Levels Table */}
                            {stage.class_levels && stage.class_levels.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs divide-y divide-gray-100">
                                        <thead className="bg-white text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-100">
                                            <tr>
                                                <th className="py-2.5 px-6">Progression Order</th>
                                                <th className="py-2.5 px-4">Level Name</th>
                                                <th className="py-2.5 px-4">Code</th>
                                                <th className="py-2.5 px-4">Configured Classes</th>
                                                <th className="py-2.5 px-4">Status</th>
                                                <th className="py-2.5 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {stage.class_levels.map((lvl) => (
                                                <tr key={lvl.id} className="hover:bg-gray-50/70 transition-colors">
                                                    <td className="py-3 px-6 font-mono font-bold text-gray-500">
                                                        Step {lvl.progression_order}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-gray-900">
                                                        {lvl.name}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-gray-600">
                                                        {lvl.code}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                                                            {lvl.classes_count ?? 0} class arms
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                            lvl.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                            {lvl.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditLevelModal(lvl)}
                                                                className="p-1 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                                                                title="Edit Level"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleLevelActive(lvl)}
                                                                className={`p-1 rounded-lg transition-colors ${
                                                                    lvl.is_active ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-emerald-600'
                                                                }`}
                                                                title={lvl.is_active ? 'Deactivate Level' : 'Activate Level'}
                                                            >
                                                                <Power className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-xs text-gray-400 italic">
                                    No class levels created under this stage yet.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODALS                                                          */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* Modal: Add Stage */}
            {addStageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setAddStageModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Add Education Stage</h3>
                            <button onClick={() => setAddStageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStageSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Stage Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={stageForm.data.name}
                                    onChange={(e) => stageForm.setData('name', e.target.value)}
                                    placeholder="e.g. Primary Education"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {stageForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{stageForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Stage Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={stageForm.data.code}
                                        onChange={(e) => stageForm.setData('code', e.target.value.toUpperCase())}
                                        placeholder="e.g. PRI"
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                                    />
                                    {stageForm.errors.code && <p className="text-red-600 text-[11px] mt-1">{stageForm.errors.code}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Display Order <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={stageForm.data.display_order}
                                        onChange={(e) => stageForm.setData('display_order', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={stageForm.data.description}
                                    onChange={(e) => stageForm.setData('description', e.target.value)}
                                    placeholder="Overview of this educational stage"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={stageForm.data.is_active}
                                        onChange={(e) => stageForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>Active Stage</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setAddStageModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={stageForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {stageForm.processing ? 'Creating...' : 'Create Stage'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Stage */}
            {editStageModalOpen && selectedStage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setEditStageModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Edit Stage {selectedStage.name}</h3>
                            <button onClick={() => setEditStageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditStageSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Stage Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={editStageForm.data.name}
                                    onChange={(e) => editStageForm.setData('name', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Stage Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={editStageForm.data.code}
                                        onChange={(e) => editStageForm.setData('code', e.target.value.toUpperCase())}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Display Order <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={editStageForm.data.display_order}
                                        onChange={(e) => editStageForm.setData('display_order', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={editStageForm.data.description}
                                    onChange={(e) => editStageForm.setData('description', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={editStageForm.data.is_active}
                                        onChange={(e) => editStageForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>Active Stage</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditStageModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editStageForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {editStageForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Class Level */}
            {addLevelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setAddLevelModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Add Class Level</h3>
                            <button onClick={() => setAddLevelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLevelSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Education Stage <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={levelForm.data.education_stage_id}
                                    onChange={(e) => levelForm.setData('education_stage_id', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {stages.map((st) => (
                                        <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Level Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={levelForm.data.name}
                                    onChange={(e) => levelForm.setData('name', e.target.value)}
                                    placeholder="e.g. Primary 1 or JSS 1"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {levelForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{levelForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Level Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={levelForm.data.code}
                                        onChange={(e) => levelForm.setData('code', e.target.value.toUpperCase())}
                                        placeholder="e.g. PRI1"
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                                    />
                                    {levelForm.errors.code && <p className="text-red-600 text-[11px] mt-1">{levelForm.errors.code}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Progression Order <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={levelForm.data.progression_order}
                                        onChange={(e) => levelForm.setData('progression_order', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={levelForm.data.description}
                                    onChange={(e) => levelForm.setData('description', e.target.value)}
                                    placeholder="Notes on this class level"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setAddLevelModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={levelForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {levelForm.processing ? 'Creating...' : 'Create Level'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Class Level */}
            {editLevelModalOpen && selectedLevel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setEditLevelModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Edit Level {selectedLevel.name}</h3>
                            <button onClick={() => setEditLevelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditLevelSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Education Stage <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={editLevelForm.data.education_stage_id}
                                    onChange={(e) => editLevelForm.setData('education_stage_id', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {stages.map((st) => (
                                        <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Level Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={editLevelForm.data.name}
                                    onChange={(e) => editLevelForm.setData('name', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Level Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={editLevelForm.data.code}
                                        onChange={(e) => editLevelForm.setData('code', e.target.value.toUpperCase())}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Progression Order <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={editLevelForm.data.progression_order}
                                        onChange={(e) => editLevelForm.setData('progression_order', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={editLevelForm.data.description}
                                    onChange={(e) => editLevelForm.setData('description', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditLevelModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLevelForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {editLevelForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
