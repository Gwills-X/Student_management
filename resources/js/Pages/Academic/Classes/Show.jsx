import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Edit3,
    GraduationCap,
    Layers,
    Plus,
    Trash2,
    Users,
    X,
    Check,
} from 'lucide-react';

export default function Show({ schoolClass, availableSubjects = [] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [subjectToRemove, setSubjectToRemove] = useState(null);

    // Edit Class Form
    const editForm = useForm({
        name: schoolClass.name || '',
        arm: schoolClass.arm || '',
        classroom: schoolClass.classroom || '',
        capacity: schoolClass.capacity || 35,
        is_active: schoolClass.is_active ?? true,
    });

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('academic.classes.update', schoolClass.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditOpen(false),
        });
    };

    const handleDeleteClass = () => {
        router.delete(route('academic.classes.destroy', schoolClass.id));
    };

    // Single Subject Assignment Form
    const assignForm = useForm({
        subject_id: '',
    });

    const handleAssignSubject = (e) => {
        e.preventDefault();
        assignForm.post(route('academic.classes.subjects.store', schoolClass.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAssignModalOpen(false);
                assignForm.reset();
            },
        });
    };

    // Bulk Subject Assignment Form
    const assignedIds = (schoolClass.subjects || []).map((s) => s.id);
    const bulkForm = useForm({
        subject_ids: [...assignedIds],
    });

    const toggleBulkSubject = (id) => {
        const current = [...bulkForm.data.subject_ids];
        if (current.includes(id)) {
            bulkForm.setData(
                'subject_ids',
                current.filter((item) => item !== id)
            );
        } else {
            bulkForm.setData('subject_ids', [...current, id]);
        }
    };

    const selectAllAvailable = () => {
        bulkForm.setData(
            'subject_ids',
            availableSubjects.map((s) => s.id)
        );
    };

    const deselectAll = () => {
        bulkForm.setData('subject_ids', []);
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        bulkForm.post(route('academic.classes.subjects.bulk-sync', schoolClass.id), {
            preserveScroll: true,
            onSuccess: () => setIsBulkModalOpen(false),
        });
    };

    // Remove single subject
    const handleRemoveSubject = () => {
        if (!subjectToRemove) return;
        router.delete(
            route('academic.classes.subjects.destroy', [schoolClass.id, subjectToRemove.id]),
            {
                preserveScroll: true,
                onSuccess: () => setSubjectToRemove(null),
            }
        );
    };

    // Filter available subjects that are not yet assigned for single modal
    const unassignedSubjects = availableSubjects.filter(
        (sub) => !assignedIds.includes(sub.id)
    );

    return (
        <AuthenticatedLayout title={`Class: ${schoolClass.name}`}>
            <Head title={`Class: ${schoolClass.name}`} />

            <div className="space-y-6 max-w-7xl mx-auto">
                <AcademicNav />

                {/* Class Header Banner */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    {schoolClass.session?.name} Academic Session
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    <Layers className="w-3.5 h-3.5 text-gray-500" />
                                    {schoolClass.class_level?.stage?.name}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        schoolClass.is_active
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            schoolClass.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                        }`}
                                    />
                                    {schoolClass.is_active ? 'Active Class' : 'Inactive Class'}
                                </span>
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                    {schoolClass.name}
                                    {schoolClass.arm ? (
                                        <span className="text-lg font-normal text-gray-500">
                                            (Arm {schoolClass.arm})
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            Single Class (No Arm)
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Level:{' '}
                                    <span className="font-medium text-gray-700">
                                        {schoolClass.class_level?.name}
                                    </span>{' '}
                                    • Classroom:{' '}
                                    <span className="font-medium text-gray-700">
                                        {schoolClass.classroom || 'Not assigned'}
                                    </span>{' '}
                                    • Capacity:{' '}
                                    <span className="font-medium text-gray-700">
                                        {schoolClass.capacity} students
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-xs transition-colors"
                            >
                                <Edit3 className="w-4 h-4 text-gray-500" />
                                <span>Edit Class</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold shadow-xs transition-colors"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                <span>Delete Class</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assigned Subjects Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary-600" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Class Curriculum &amp; Subjects
                                </h2>
                                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                                    {(schoolClass.subjects || []).length} Assigned
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Subjects taught in {schoolClass.name} for the {schoolClass.session?.name} academic session.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    bulkForm.setData('subject_ids', [...assignedIds]);
                                    setIsBulkModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Layers className="w-4 h-4 text-gray-500" />
                                <span>Bulk Manage Subjects</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAssignModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Assign Subject</span>
                            </button>
                        </div>
                    </div>

                    {/* Subjects Table */}
                    {(schoolClass.subjects || []).length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">
                                No subjects assigned yet
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                Assign curriculum subjects applicable to {schoolClass.class_level?.stage?.name} to this class.
                            </p>
                            <div className="mt-5 flex justify-center gap-3">
                                <button
                                    onClick={() => {
                                        bulkForm.setData('subject_ids', [...assignedIds]);
                                        setIsBulkModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Assign Subjects Now</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Subject Code</th>
                                        <th className="py-3.5 px-6">Subject Name</th>
                                        <th className="py-3.5 px-6">Applicable Stages</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {(schoolClass.subjects || []).map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-6 font-mono font-semibold text-primary-700">
                                                <span className="px-2 py-1 rounded-md bg-primary-50 border border-primary-200 text-xs">
                                                    {subject.code}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-900">
                                                <Link
                                                    href={route('academic.subjects.show', subject.id)}
                                                    className="hover:text-primary-600 transition-colors"
                                                >
                                                    {subject.name}
                                                </Link>
                                                {subject.description && (
                                                    <p className="text-xs text-gray-400 font-normal line-clamp-1 mt-0.5">
                                                        {subject.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {(subject.stages || []).map((stage) => (
                                                        <span
                                                            key={stage.id}
                                                            className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                                        >
                                                            {stage.code || stage.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        subject.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            subject.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                                        }`}
                                                    />
                                                    {subject.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSubjectToRemove(subject)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Remove</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Class Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setIsEditOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Edit Class Group</h3>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Class Display Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                                {editForm.errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Arm / Stream <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.arm}
                                        onChange={(e) => editForm.setData('arm', e.target.value)}
                                        placeholder="Leave empty if single class"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {editForm.errors.arm && (
                                        <p className="mt-1 text-xs text-red-600">{editForm.errors.arm}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={editForm.data.capacity}
                                        onChange={(e) => editForm.setData('capacity', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {editForm.errors.capacity && (
                                        <p className="mt-1 text-xs text-red-600">{editForm.errors.capacity}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Physical Classroom
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.classroom}
                                    onChange={(e) => editForm.setData('classroom', e.target.value)}
                                    placeholder="e.g. Block B, Room 102"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                {editForm.errors.classroom && (
                                    <p className="mt-1 text-xs text-red-600">{editForm.errors.classroom}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_active"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700">
                                    Active class group
                                </label>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Single Subject Assign Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setIsAssignModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Assign Subject</h3>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {unassignedSubjects.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500">
                                All applicable subjects for {schoolClass.class_level?.stage?.name} are already assigned to this class.
                            </div>
                        ) : (
                            <form onSubmit={handleAssignSubject} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Select Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={assignForm.data.subject_id}
                                        onChange={(e) => assignForm.setData('subject_id', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                        required
                                    >
                                        <option value="">-- Choose Subject --</option>
                                        {unassignedSubjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                [{sub.code}] {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                    {assignForm.errors.subject_id && (
                                        <p className="mt-1 text-xs text-red-600">{assignForm.errors.subject_id}</p>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAssignModalOpen(false)}
                                        className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={assignForm.processing || !assignForm.data.subject_id}
                                        className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50"
                                    >
                                        {assignForm.processing ? 'Assigning...' : 'Assign to Class'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Bulk Subject Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setIsBulkModalOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Bulk Manage Subjects</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Select subjects to offer in {schoolClass.name} ({schoolClass.class_level?.stage?.name}).
                                </p>
                            </div>
                            <button
                                onClick={() => setIsBulkModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                {bulkForm.data.subject_ids.length} of {availableSubjects.length} Selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllAvailable}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold px-2 py-1 rounded hover:bg-primary-50"
                                >
                                    Select All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    type="button"
                                    onClick={deselectAll}
                                    className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-2 py-1 rounded hover:bg-gray-50"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto py-4 space-y-2">
                            {availableSubjects.map((sub) => {
                                const isChecked = bulkForm.data.subject_ids.includes(sub.id);
                                return (
                                    <label
                                        key={sub.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                                            isChecked
                                                ? 'bg-primary-50/60 border-primary-300 text-primary-900'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleBulkSubject(sub.id)}
                                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            />
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    <span className="font-mono text-xs mr-2 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200">
                                                        {sub.code}
                                                    </span>
                                                    {sub.name}
                                                </div>
                                                {sub.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                                        {sub.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isChecked && (
                                            <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                        )}
                                    </label>
                                );
                            })}

                            {bulkForm.errors.subject_ids && (
                                <p className="mt-2 text-xs text-red-600">{bulkForm.errors.subject_ids}</p>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bulkForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50"
                                >
                                    {bulkForm.processing ? 'Syncing...' : 'Save Subject Assignments'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Subject Removal Modal */}
            <ConfirmationModal
                isOpen={Boolean(subjectToRemove)}
                title="Remove Subject from Class"
                message={`Are you sure you want to remove '${subjectToRemove?.name}' (${subjectToRemove?.code}) from class ${schoolClass.name}? This removes the curriculum assignment for this specific class group.`}
                confirmText="Remove Subject"
                isDanger={true}
                onConfirm={handleRemoveSubject}
                onClose={() => setSubjectToRemove(null)}
            />

            {/* Confirm Class Deletion Modal */}
            <ConfirmationModal
                isOpen={isDeleteOpen}
                title="Delete Class Group"
                message={`Are you sure you want to delete class ${schoolClass.name}? This will remove this class group and its subject associations.`}
                confirmText="Delete Class"
                isDanger={true}
                onConfirm={handleDeleteClass}
                onClose={() => setIsDeleteOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
