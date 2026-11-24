import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Check,
    Layers,
    School,
    Users,
} from 'lucide-react';

export default function Create({
    sessions = [],
    defaultSessionId,
    classLevels = [],
    suggestedArms = ['A', 'B', 'C', 'D', 'Gold', 'Diamond', 'Silver'],
}) {
    const { data, setData, post, processing, errors } = useForm({
        academic_session_id: defaultSessionId || (sessions[0]?.id ?? ''),
        class_level_id: classLevels[0]?.id ?? '',
        arm: '',
        name: '',
        classroom: '',
        capacity: 35,
        is_active: true,
    });

    const selectedLevel = classLevels.find((lvl) => String(lvl.id) === String(data.class_level_id));

    // Compute preview
    let generatedNamePreview = selectedLevel ? selectedLevel.name : '';
    if (selectedLevel && data.arm && data.arm.trim() !== '') {
        const trimmedArm = data.arm.trim();
        const sep = (trimmedArm.length === 1 && /^[a-zA-Z]$/.test(trimmedArm)) ? '' : ' ';
        generatedNamePreview = `${selectedLevel.name}${sep}${trimmedArm}`;
    }

    function handleSubmit(e) {
        e.preventDefault();
        post('/academic/classes');
    }

    return (
        <AuthenticatedLayout title="Register Class">
            <div className="max-w-3xl mx-auto space-y-6">
                <AcademicNav currentTab="classes" />

                <div className="flex items-center gap-2">
                    <Link
                        href="/academic/classes"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Classes</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                    <div className="pb-4 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            Register Academic Class
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Create a class with or without an arm division (e.g. JSS 1 as a single class, or JSS 1A, JSS 1B, Primary 2 Gold) for an academic session.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        {/* Academic Session */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Academic Session <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={data.academic_session_id}
                                onChange={(e) => setData('academic_session_id', e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 font-mono"
                            >
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.is_current ? '— (Current Active)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.academic_session_id && <p className="text-red-600 text-[11px] mt-1">{errors.academic_session_id}</p>}
                        </div>

                        {/* Class Level */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Class Level <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={data.class_level_id}
                                onChange={(e) => setData('class_level_id', e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                            >
                                {classLevels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        {lvl.name} ({lvl.stage?.name})
                                    </option>
                                ))}
                            </select>
                            {errors.class_level_id && <p className="text-red-600 text-[11px] mt-1">{errors.class_level_id}</p>}
                        </div>

                        {/* Arm / Stream (Optional) */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block font-semibold text-gray-700">
                                    Arm / Stream Division <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <span className="text-[11px] text-gray-500">
                                    Leave blank for single class without arms
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={data.arm}
                                    onChange={(e) => setData('arm', e.target.value)}
                                    placeholder="Leave empty or e.g. A, B, Gold, Diamond"
                                    className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className="text-[11px] text-gray-400">Quick options:</span>
                                <button
                                    type="button"
                                    onClick={() => setData('arm', '')}
                                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                                        !data.arm ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                                    }`}
                                >
                                    None (Single Class)
                                </button>
                                {suggestedArms.map((arm) => (
                                    <button
                                        type="button"
                                        key={arm}
                                        onClick={() => setData('arm', arm)}
                                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                                            data.arm === arm ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                                        }`}
                                    >
                                        {arm}
                                    </button>
                                ))}
                            </div>
                            {errors.arm && <p className="text-red-600 text-[11px] mt-1">{errors.arm}</p>}
                        </div>

                        {/* Custom Name Override (Optional) */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Class Name <span className="text-gray-400 font-normal">(Leave empty to auto-use "{generatedNamePreview}")</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={generatedNamePreview}
                                className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                            />
                            {errors.name && <p className="text-red-600 text-[11px] mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Classroom */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">
                                    Physical Classroom
                                </label>
                                <input
                                    type="text"
                                    value={data.classroom}
                                    onChange={(e) => setData('classroom', e.target.value)}
                                    placeholder="e.g. Room 102, Block A"
                                    className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">
                                    Student Capacity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={data.capacity}
                                    onChange={(e) => setData('capacity', e.target.value)}
                                    className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center pt-2">
                            <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span>Class is active</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href="/academic/classes"
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                <span>{processing ? 'Registering...' : 'Register Class'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
