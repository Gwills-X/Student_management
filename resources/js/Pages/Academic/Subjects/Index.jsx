import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import ConfirmationModal from '@/Components/ConfirmationModal';
import Pagination from '@/Components/Pagination';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen,
    Edit3,
    Filter,
    Layers,
    Plus,
    Search,
    Trash2,
    X,
    Eye,
} from 'lucide-react';

export default function Index({ subjects = { data: [] }, stages = [], filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStage, setSelectedStage] = useState(filters.stage_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    // Filter Trigger
    const handleFilterChange = (stage, status, search) => {
        router.get(
            route('academic.subjects.index'),
            {
                search: search !== undefined ? search : searchQuery,
                stage_id: stage !== undefined ? stage : selectedStage,
                status: status !== undefined ? status : selectedStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(selectedStage, selectedStatus, searchQuery);
    };

    // Create Form
    const createForm = useForm({
        name: '',
        code: '',
        description: '',
        stages: [],
        is_active: true,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('academic.subjects.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const toggleCreateStage = (stageId) => {
        const current = [...createForm.data.stages];
        if (current.includes(stageId)) {
            createForm.setData(
                'stages',
                current.filter((id) => id !== stageId)
            );
        } else {
            createForm.setData('stages', [...current, stageId]);
        }
    };

    // Edit Form
    const editForm = useForm({
        name: '',
        code: '',
        description: '',
        stages: [],
        is_active: true,
    });

    const openEditModal = (subject) => {
        setEditingSubject(subject);
        editForm.setData({
            name: subject.name || '',
            code: subject.code || '',
            description: subject.description || '',
            stages: (subject.stages || []).map((s) => s.id),
            is_active: subject.is_active ?? true,
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('academic.subjects.update', editingSubject.id), {
            preserveScroll: true,
            onSuccess: () => setEditingSubject(null),
        });
    };

    const toggleEditStage = (stageId) => {
        const current = [...editForm.data.stages];
        if (current.includes(stageId)) {
            editForm.setData(
                'stages',
                current.filter((id) => id !== stageId)
            );
        } else {
            editForm.setData('stages', [...current, stageId]);
        }
    };

    // Delete Subject
    const handleDeleteSubject = () => {
        if (!subjectToDelete) return;
        router.delete(route('academic.subjects.destroy', subjectToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setSubjectToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout title="Academic Subjects">
            <Head title="Academic Subjects" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <AcademicNav />

                {/* Header & Actions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-3">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Curriculum &amp; Course Catalog</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                Academic Subjects
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Configure subjects taught across education stages and assign them to specific class groups.
                            </p>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Subject</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-3">
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Search by subject name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </form>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedStage}
                                onChange={(e) => {
                                    setSelectedStage(e.target.value);
                                    handleFilterChange(e.target.value, selectedStatus, searchQuery);
                                }}
                                className="px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            >
                                <option value="">All Education Stages</option>
                                {stages.map((stg) => (
                                    <option key={stg.id} value={stg.id}>
                                        {stg.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange(selectedStage, e.target.value, searchQuery);
                                }}
                                className="px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Subjects Directory Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {subjects.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">
                                No subjects found
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                No academic subjects matched your search or filters. Click below to add a new subject.
                            </p>
                            <div className="mt-5">
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create Subject</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Code</th>
                                        <th className="py-3.5 px-6">Subject Name</th>
                                        <th className="py-3.5 px-6">Education Stages</th>
                                        <th className="py-3.5 px-6 text-center">Classes Offering</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {subjects.data.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-6 font-mono font-semibold text-primary-700">
                                                <span className="px-2 py-1 rounded-md bg-primary-50 border border-primary-200 text-xs">
                                                    {subject.code}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-900">
                                                <Link
                                                    href={route('academic.subjects.show', subject.id)}
                                                    className="hover:text-primary-600 font-semibold transition-colors"
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
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    {subject.classes_count ?? 0} {subject.classes_count === 1 ? 'class' : 'classes'}
                                                </span>
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('academic.subjects.show', subject.id)}
                                                        className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                        title="View details & classes"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(subject)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                        title="Edit Subject"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSubjectToDelete(subject)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete Subject"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {subjects.links && (
                        <div className="p-4 border-t border-gray-100">
                            <Pagination links={subjects.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Subject Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setIsCreateOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Create Academic Subject</h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Subject Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mathematics, English Language, Physics"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Unique Subject Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. MTH, ENG, PHY, BIO"
                                    value={createForm.data.code}
                                    onChange={(e) => createForm.setData('code', e.target.value.toUpperCase())}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono uppercase focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                                {createForm.errors.code && (
                                    <p className="mt-1 text-xs text-red-600">{createForm.errors.code}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Applicable Education Stages <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                                    {stages.map((stg) => {
                                        const isChecked = createForm.data.stages.includes(stg.id);
                                        return (
                                            <label
                                                key={stg.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCreateStage(stg.id)}
                                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                />
                                                <span className="text-sm font-medium text-gray-800">
                                                    {stg.name}{' '}
                                                    <span className="text-xs text-gray-400">
                                                        ({stg.code})
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {createForm.errors.stages && (
                                    <p className="mt-1 text-xs text-red-600">{createForm.errors.stages}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Brief curriculum description..."
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                {createForm.errors.description && (
                                    <p className="mt-1 text-xs text-red-600">{createForm.errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="create_is_active"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <label htmlFor="create_is_active" className="text-sm font-medium text-gray-700">
                                    Active curriculum subject
                                </label>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Subject Modal */}
            {editingSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setEditingSubject(null)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Edit Subject: {editingSubject.name}</h3>
                            <button
                                onClick={() => setEditingSubject(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Subject Name <span className="text-red-500">*</span>
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

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Unique Subject Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.code}
                                    onChange={(e) => editForm.setData('code', e.target.value.toUpperCase())}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono uppercase focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                                {editForm.errors.code && (
                                    <p className="mt-1 text-xs text-red-600">{editForm.errors.code}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Applicable Education Stages <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                                    {stages.map((stg) => {
                                        const isChecked = editForm.data.stages.includes(stg.id);
                                        return (
                                            <label
                                                key={stg.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleEditStage(stg.id)}
                                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                />
                                                <span className="text-sm font-medium text-gray-800">
                                                    {stg.name}{' '}
                                                    <span className="text-xs text-gray-400">
                                                        ({stg.code})
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {editForm.errors.stages && (
                                    <p className="mt-1 text-xs text-red-600">{editForm.errors.stages}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows="2"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                {editForm.errors.description && (
                                    <p className="mt-1 text-xs text-red-600">{editForm.errors.description}</p>
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
                                    Active curriculum subject
                                </label>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingSubject(null)}
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

            {/* Confirm Subject Delete Modal */}
            <ConfirmationModal
                isOpen={Boolean(subjectToDelete)}
                title="Delete Academic Subject"
                message={`Are you sure you want to delete '${subjectToDelete?.name}' (${subjectToDelete?.code})? This will permanently remove the subject if it has no classes assigned.`}
                confirmText="Delete Subject"
                isDanger={true}
                onConfirm={handleDeleteSubject}
                onClose={() => setSubjectToDelete(null)}
            />
        </AuthenticatedLayout>
    );
}
