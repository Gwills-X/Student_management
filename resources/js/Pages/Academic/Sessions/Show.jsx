import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Pencil,
    Plus,
    School,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ session }) {
    const [addTermModalOpen, setAddTermModalOpen] = useState(false);
    const [editTermModalOpen, setEditTermModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDanger: false,
        onConfirm: () => {},
    });

    // ── Form: Add Term ─────────────────────────────────────────────────────
    const termForm = useForm({
        name: 'First Term',
        term_order: (session.terms?.length || 0) + 1,
        start_date: session.start_date,
        end_date: session.end_date,
        status: 'upcoming',
        is_current: false,
    });

    function handleAddTermSubmit(e) {
        e.preventDefault();
        termForm.post(`/academic/sessions/${session.id}/terms`, {
            onSuccess: () => {
                setAddTermModalOpen(false);
                termForm.reset();
            },
        });
    }

    // ── Form: Edit Term ────────────────────────────────────────────────────
    const editTermForm = useForm({
        name: '',
        term_order: 1,
        start_date: '',
        end_date: '',
        status: 'upcoming',
    });

    function openEditTermModal(term) {
        setSelectedTerm(term);
        editTermForm.setData({
            name: term.name,
            term_order: term.term_order,
            start_date: term.start_date,
            end_date: term.end_date,
            status: term.status,
        });
        setEditTermModalOpen(true);
    }

    function handleEditTermSubmit(e) {
        e.preventDefault();
        editTermForm.put(`/academic/terms/${selectedTerm.id}`, {
            onSuccess: () => {
                setEditTermModalOpen(false);
                setSelectedTerm(null);
            },
        });
    }

    // ── Make Current Term ──────────────────────────────────────────────────
    function triggerMakeCurrentTerm(term) {
        setConfirmModal({
            isOpen: true,
            title: 'Set as Current Academic Term',
            message: `Are you sure you want to set ${term.name} as the school's active current term? Any previously active term will be deactivated.`,
            confirmText: 'Set as Current Term',
            isDanger: false,
            onConfirm: () => {
                router.patch(`/academic/terms/${term.id}/make-current`, {}, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    // ── Delete Term ────────────────────────────────────────────────────────
    function triggerDeleteTerm(term) {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Academic Term',
            message: `Are you sure you want to delete '${term.name}' from ${session.name}?`,
            confirmText: 'Delete Term',
            isDanger: true,
            onConfirm: () => {
                router.delete(`/academic/terms/${term.id}`, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    return (
        <AuthenticatedLayout title={`Session ${session.name}`}>
            <div className="max-w-7xl mx-auto space-y-6">
                <AcademicNav currentTab="sessions" />

                {/* Back button */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/academic/sessions"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>All Sessions</span>
                    </Link>
                </div>

                {/* Session Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-mono">
                                    {session.name}
                                </h1>
                                {session.is_current && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Current Active Session</span>
                                    </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700 border border-gray-200">
                                    {session.status}
                                </span>
                            </div>

                            <p className="text-xs text-gray-500 mt-2 font-mono">
                                Calendar Range: <span className="font-semibold text-gray-900">{session.start_date}</span> to <span className="font-semibold text-gray-900">{session.end_date}</span>
                            </p>
                            {session.description && (
                                <p className="text-xs text-gray-600 mt-1 max-w-2xl">{session.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/academic/classes/create"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Class in Session</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 1: Academic Terms ─────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Academic Terms in this Session</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Only one term across the entire school may be designated active current at any time.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAddTermModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-colors"
                        >
                            <Plus className="w-4 h-4 text-primary-600" />
                            <span>Add Term</span>
                        </button>
                    </div>

                    {session.terms && session.terms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-3">Order</th>
                                        <th className="py-2.5 px-3">Term Name</th>
                                        <th className="py-2.5 px-3">Date Range</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {session.terms.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-3 font-mono font-bold text-gray-500">
                                                #{t.term_order}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{t.name}</span>
                                                    {t.is_current && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            Current Term
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 font-mono text-[11px] text-gray-600">
                                                {t.start_date} &rarr; {t.end_date}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize border ${
                                                        t.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : t.status === 'completed'
                                                            ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}
                                                >
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    {!t.is_current && (
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerMakeCurrentTerm(t)}
                                                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                                                        >
                                                            Make Current
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditTermModal(t)}
                                                        className="p-1 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                                                        title="Edit Term"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    {!t.is_current && (
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerDeleteTerm(t)}
                                                            className="p-1 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-colors"
                                                            title="Delete Term"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 font-medium">No terms registered for this session yet.</p>
                            <button
                                type="button"
                                onClick={() => setAddTermModalOpen(true)}
                                className="mt-2 text-xs font-semibold text-primary-600 hover:underline"
                            >
                                Add First Term &rarr;
                            </button>
                        </div>
                    )}
                </div>

                {/* ── SECTION 2: Classes in this Session ─────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Configured Classes for this Session</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Actual class arms running in {session.name} (e.g. JSS 1A, JSS 1B).
                            </p>
                        </div>
                        <Link
                            href="/academic/classes/create"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-colors"
                        >
                            <Plus className="w-4 h-4 text-primary-600" />
                            <span>Add Class Arm</span>
                        </Link>
                    </div>

                    {session.classes && session.classes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {session.classes.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/academic/classes/${c.id}`}
                                    className="p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-xs transition-all bg-gray-50/50 block group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900 group-hover:text-primary-600 text-sm">
                                            {c.name}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                            {c.class_level?.stage?.name || 'Stage'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Level: <span className="font-medium text-gray-700">{c.class_level?.name}</span> &bull; Arm: <span className="font-medium text-gray-700">{c.arm}</span>
                                    </p>
                                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                                        <span>Capacity: {c.capacity || 35}</span>
                                        <span className="text-primary-600 font-semibold">{c.subjects_count ?? 0} subjects &rarr;</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                            <School className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 font-medium">No class groups created for this session yet.</p>
                            <Link
                                href="/academic/classes/create"
                                className="mt-2 inline-block text-xs font-semibold text-primary-600 hover:underline"
                            >
                                Register Class Groups &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODALS                                                          */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* Modal: Add Term */}
            {addTermModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setAddTermModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Add Academic Term to {session.name}</h3>
                            <button onClick={() => setAddTermModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTermSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Term Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={termForm.data.name}
                                    onChange={(e) => termForm.setData('name', e.target.value)}
                                    placeholder="e.g. First Term / Second Term / Third Term"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {termForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{termForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Term Order <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    required
                                    value={termForm.data.term_order}
                                    onChange={(e) => termForm.setData('term_order', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {termForm.errors.term_order && <p className="text-red-600 text-[11px] mt-1">{termForm.errors.term_order}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        min={session.start_date}
                                        max={session.end_date}
                                        value={termForm.data.start_date}
                                        onChange={(e) => termForm.setData('start_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {termForm.errors.start_date && <p className="text-red-600 text-[11px] mt-1">{termForm.errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        min={session.start_date}
                                        max={session.end_date}
                                        value={termForm.data.end_date}
                                        onChange={(e) => termForm.setData('end_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {termForm.errors.end_date && <p className="text-red-600 text-[11px] mt-1">{termForm.errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Initial Status</label>
                                <select
                                    value={termForm.data.status}
                                    onChange={(e) => termForm.setData('status', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={termForm.data.is_current}
                                        onChange={(e) => termForm.setData('is_current', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>Set as active current term across the school</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setAddTermModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={termForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {termForm.processing ? 'Adding...' : 'Add Term'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Term */}
            {editTermModalOpen && selectedTerm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setEditTermModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Edit Term {selectedTerm.name}</h3>
                            <button onClick={() => setEditTermModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditTermSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Term Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={editTermForm.data.name}
                                    onChange={(e) => editTermForm.setData('name', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {editTermForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{editTermForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Term Order <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    required
                                    value={editTermForm.data.term_order}
                                    onChange={(e) => editTermForm.setData('term_order', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        min={session.start_date}
                                        max={session.end_date}
                                        value={editTermForm.data.start_date}
                                        onChange={(e) => editTermForm.setData('start_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {editTermForm.errors.start_date && <p className="text-red-600 text-[11px] mt-1">{editTermForm.errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        min={session.start_date}
                                        max={session.end_date}
                                        value={editTermForm.data.end_date}
                                        onChange={(e) => editTermForm.setData('end_date', e.target.value)}
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {editTermForm.errors.end_date && <p className="text-red-600 text-[11px] mt-1">{editTermForm.errors.end_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    value={editTermForm.data.status}
                                    onChange={(e) => editTermForm.setData('status', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditTermModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editTermForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {editTermForm.processing ? 'Saving...' : 'Save Changes'}
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
