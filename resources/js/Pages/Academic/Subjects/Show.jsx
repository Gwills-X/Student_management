import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    GraduationCap,
    Layers,
    Trash2,
    Users,
} from 'lucide-react';

export default function Show({ subject }) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleDelete = () => {
        router.delete(route('academic.subjects.destroy', subject.id));
    };

    const classes = subject.classes || [];

    return (
        <AuthenticatedLayout title={`Subject: ${subject.name}`}>
            <Head title={`Subject: ${subject.name}`} />

            <div className="space-y-6 max-w-7xl mx-auto">
                <AcademicNav />

                {/* Back Link */}
                <div>
                    <Link
                        href={route('academic.subjects.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Subjects Directory</span>
                    </Link>
                </div>

                {/* Subject Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-primary-50 text-primary-700 border border-primary-200">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {subject.code}
                                </span>
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
                                    {subject.is_active ? 'Active Curriculum' : 'Inactive'}
                                </span>
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {subject.name}
                                </h1>
                                {subject.description && (
                                    <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                                        {subject.description}
                                    </p>
                                )}
                            </div>

                            {/* Applicable stages */}
                            <div className="pt-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Applicable Education Stages
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(subject.stages || []).map((stage) => (
                                        <span
                                            key={stage.id}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                                        >
                                            <Layers className="w-3 h-3 text-gray-500" />
                                            {stage.name} ({stage.code})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(true)}
                                disabled={classes.length > 0}
                                title={
                                    classes.length > 0
                                        ? 'Cannot delete subject while assigned to classes'
                                        : 'Delete Subject'
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                <span>Delete Subject</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Classes Offering This Subject */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-primary-600" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Classes Offering this Subject
                                </h2>
                                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                                    {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Session-specific class groups where '{subject.name}' is included in the curriculum.
                            </p>
                        </div>
                    </div>

                    {classes.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">
                                Not assigned to any class yet
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                To teach this subject, navigate to a class group and assign it from the class curriculum view.
                            </p>
                            <div className="mt-5">
                                <Link
                                    href={route('academic.classes.index')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs"
                                >
                                    <span>Browse Classes</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Academic Session</th>
                                        <th className="py-3.5 px-6">Class Group</th>
                                        <th className="py-3.5 px-6">Stage &amp; Level</th>
                                        <th className="py-3.5 px-6">Classroom</th>
                                        <th className="py-3.5 px-6">Capacity</th>
                                        <th className="py-3.5 px-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {classes.map((cls) => (
                                        <tr key={cls.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-4 px-6 font-medium text-gray-900">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {cls.session?.name}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-gray-900">
                                                <Link
                                                    href={route('academic.classes.show', cls.id)}
                                                    className="hover:text-primary-600 transition-colors"
                                                >
                                                    {cls.name}
                                                </Link>
                                                {cls.arm && (
                                                    <span className="text-xs font-normal text-gray-500 ml-1.5">
                                                        (Arm {cls.arm})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                <span>{cls.class_level?.name}</span>
                                                <span className="text-xs text-gray-400 ml-1">
                                                    ({cls.class_level?.stage?.name})
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {cls.classroom || '—'}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {cls.capacity} students
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    href={route('academic.classes.show', cls.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <span>View Class</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Subject Delete Modal */}
            <ConfirmationModal
                isOpen={isDeleteOpen}
                title="Delete Subject"
                message={`Are you sure you want to permanently delete '${subject.name}' (${subject.code})?`}
                confirmText="Delete Subject"
                isDanger={true}
                onConfirm={handleDelete}
                onClose={() => setIsDeleteOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
