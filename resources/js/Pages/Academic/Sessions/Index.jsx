import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    Pencil,
    Plus,
    School,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ sessions = [], currentSession = null, can = {} }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDanger: false,
        onConfirm: () => {},
    });

    // ── Form: Create Session ───────────────────────────────────────────────
    const createForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
        is_current: false,
        description: '',
    });

    function handleCreateSubmit(e) {
        e.preventDefault();
        createForm.post('/academic/sessions', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    }

    // ── Form: Edit Session ─────────────────────────────────────────────────
    const editForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
        description: '',
    });

    function openEditModal(session) {
        setSelectedSession(session);
        editForm.setData({
            name: session.name,
            start_date: session.start_date,
            end_date: session.end_date,
            status: session.status,
            description: session.description || '',
        });
        setEditModalOpen(true);
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        editForm.put(`/academic/sessions/${selectedSession.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedSession(null);
            },
        });
    }

    // ── Make Current Action ────────────────────────────────────────────────
    function triggerMakeCurrent(session) {
        setConfirmModal({
            isOpen: true,
            title: 'Set as Active Academic Session',
            message: `Are you sure you want to set ${session.name} as the school's active current session? Any previously active session will be unset.`,
            confirmText: 'Set as Current Session',
            isDanger: false,
            onConfirm: () => {
                router.patch(`/academic/sessions/${session.id}/make-current`, {}, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    // ── Delete Action ──────────────────────────────────────────────────────
    function triggerDelete(session) {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Academic Session',
            message: `Are you sure you want to delete session ${session.name}? This action cannot be undone.`,
            confirmText: 'Delete Session',
            isDanger: true,
            onConfirm: () => {
                router.delete(`/academic/sessions/${session.id}`, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    return (
        <AuthenticatedLayout title="Academic Sessions &amp; Terms">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Academic Subnav */}
                <AcademicNav currentTab="sessions" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Academic Sessions &amp; Terms
                        </h1>
                        <p className="text-gray-500 text-xs mt-0.5">
                            Manage school academic years, term timelines, and active operational indicators.
                        </p>
                    </div>
                    {can["sessions.create"] && (
                    <button
                        type="button"
                        onClick={() => {
                            createForm.reset();
                            setCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Academic Session</span>
                    </button>
                    )}
                </div>

                {/* Current Active Banner */}
                {currentSession ? (
                    <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-6 text-white shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Active Current Academic Session</span>
                                </span>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {currentSession.name} Academic Session
                                </h2>
                                <p className="text-primary-200 text-xs mt-1">
                                    Running from <span className="font-semibold text-white">{currentSession.start_date}</span> to <span className="font-semibold text-white">{currentSession.end_date}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/academic/sessions/${currentSession.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary-900 text-xs font-bold hover:bg-primary-50 transition-colors shadow-xs"
                                >
                                    <span>Manage Terms &amp; Classes</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 text-xs">
                        <p className="font-bold">No active session designated</p>
                        <p className="mt-0.5">Please designate a current academic session below so the school calendar operates smoothly.</p>
                    </div>
                )}

                {/* All Sessions Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">All Academic Sessions</h3>
                        <span className="text-xs text-gray-500 font-medium">{sessions.length} recorded</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Session Name</th>
                                    <th className="py-3 px-4">Date Timeline</th>
                                    <th className="py-3 px-4">Terms</th>
                                    <th className="py-3 px-4">Classes</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {sessions.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                                        {/* Name & current badge */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/academic/sessions/${s.id}`}
                                                    className="font-bold text-gray-900 hover:text-primary-600 font-mono text-sm"
                                                >
                                                    {s.name}
                                                </Link>
                                                {s.is_current && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            {s.description && (
                                                <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{s.description}</p>
                                            )}
                                        </td>

                                        {/* Date Timeline */}
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                                            {s.start_date} &rarr; {s.end_date}
                                        </td>

                                        {/* Terms count */}
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                                                {s.terms_count ?? 0} Terms
                                            </span>
                                        </td>

                                        {/* Classes count */}
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700">
                                                {s.classes_count ?? 0} Classes
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                                                    s.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : s.status === 'completed'
                                                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}
                                            >
                                                {s.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                {can["sessions.activate"] && !s.is_current && (
                                                    <button
                                                        type="button"
                                                        onClick={() => triggerMakeCurrent(s)}
                                                        className="px-2 py-1 rounded-lg text-[11px] font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                                                    >
                                                        Set Current
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/academic/sessions/${s.id}`}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                                                    title="View Terms & Classes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {can["sessions.edit"] && (
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(s)}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                                                    title="Edit Session"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                )}
                                                {can["sessions.delete"] && !s.is_current && s.terms_count === 0 && s.classes_count === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => triggerDelete(s)}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-colors"
                                                        title="Delete Session"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODALS                                                          */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* Modal: Create Session */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setCreateModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Create Academic Session</h3>
                            <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Session Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. 2026/2027"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                                />
                                {createForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.start_date}
                                        onChange={(e) => createForm.setData('start_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {createForm.errors.start_date && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.data.end_date}
                                        onChange={(e) => createForm.setData('end_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {createForm.errors.end_date && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Initial Status <span className="text-red-500">*</span></label>
                                <select
                                    value={createForm.data.status}
                                    onChange={(e) => createForm.setData('status', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <textarea
                                    rows={2}
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="Session notes or overview"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_current}
                                        onChange={(e) => createForm.setData('is_current', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>Set as active current session immediately</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Session */}
            {editModalOpen && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setEditModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Edit Session {selectedSession.name}</h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Session Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                                />
                                {editForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{editForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.data.start_date}
                                        onChange={(e) => editForm.setData('start_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.data.end_date}
                                        onChange={(e) => editForm.setData('end_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                                <select
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDanger={confirmModal.isDanger}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            />
        </AuthenticatedLayout>
    );
}
