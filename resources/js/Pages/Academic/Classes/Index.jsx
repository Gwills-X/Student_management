import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AcademicNav from '@/Components/AcademicNav';
import Pagination from '@/Components/Pagination';
import { Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    ChevronRight,
    Eye,
    Filter,
    Layers,
    Plus,
    RotateCcw,
    School,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({
    classes,
    sessions = [],
    selectedSessionId,
    stages = [],
    classLevels = [],
    filters = {},
    can = {},
}) {
    const [sessionId, setSessionId] = useState(selectedSessionId || '');
    const [stageId, setStageId] = useState(filters.stage_id || '');
    const [levelId, setLevelId] = useState(filters.level_id || '');
    const [search, setSearch] = useState(filters.search || '');

    function handleFilter(e) {
        e?.preventDefault();
        router.get(
            '/academic/classes',
            {
                session_id: sessionId || undefined,
                stage_id: stageId || undefined,
                level_id: levelId || undefined,
                search: search || undefined,
            },
            { preserveState: true, replace: true }
        );
    }

    function handleReset() {
        setStageId('');
        setLevelId('');
        setSearch('');
        router.get('/academic/classes', { session_id: sessionId }, { replace: true });
    }

    return (
        <AuthenticatedLayout title="Classes &amp; Arms">
            <div className="max-w-7xl mx-auto space-y-6">
                <AcademicNav currentTab="classes" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Classes &amp; Arms
                        </h1>
                        <p className="text-gray-500 text-xs mt-0.5">
                            Manage session-specific class divisions (e.g. JSS 1A, JSS 1B, Primary 2 Gold) and subject offerings.
                        </p>
                    </div>
                    {can["classes.create"] && (
                    <Link
                        href="/academic/classes/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Register New Class</span>
                    </Link>
                    )}
                </div>

                {/* Filter and Session Selector Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                    <form onSubmit={handleFilter} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Academic Session Picker */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Academic Session
                                </label>
                                <select
                                    value={sessionId}
                                    onChange={(e) => {
                                        setSessionId(e.target.value);
                                        router.get('/academic/classes', {
                                            session_id: e.target.value,
                                            stage_id: stageId || undefined,
                                            level_id: levelId || undefined,
                                            search: search || undefined,
                                        }, { preserveState: true, replace: true });
                                    }}
                                    className="w-full py-2 px-3 rounded-xl border border-primary-200 bg-primary-50/50 text-xs text-primary-900 font-semibold focus:ring-2 focus:ring-primary-500 font-mono"
                                >
                                    {sessions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.is_current ? '— (Current Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stage Picker */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Education Stage
                                </label>
                                <select
                                    value={stageId}
                                    onChange={(e) => setStageId(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Stages</option>
                                    {stages.map((st) => (
                                        <option key={st.id} value={st.id}>{st.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Level Picker */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Class Level
                                </label>
                                <select
                                    value={levelId}
                                    onChange={(e) => setLevelId(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Levels</option>
                                    {classLevels.map((lvl) => (
                                        <option key={lvl.id} value={lvl.id}>{lvl.name} ({lvl.code})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Search Class / Arm
                                </label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="e.g. JSS 1A, Gold..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filters</span>
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-xs font-semibold text-white shadow-xs transition-colors"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Apply Filters</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {classes.data.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <School className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">No class groups found</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                No classes configured for this academic session matching your filters.
                            </p>
                            {can["classes.create"] && (
                            <Link
                                href="/academic/classes/create"
                                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Register New Class</span>
                            </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Class Group</th>
                                        <th className="py-3 px-4">Level &amp; Stage</th>
                                        <th className="py-3 px-4">Arm / Stream</th>
                                        <th className="py-3 px-4">Classroom</th>
                                        <th className="py-3 px-4">Capacity</th>
                                        <th className="py-3 px-4">Subjects Offered</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {classes.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Name */}
                                            <td className="py-3.5 px-4">
                                                <Link
                                                    href={`/academic/classes/${c.id}`}
                                                    className="font-bold text-gray-900 hover:text-primary-600 text-sm"
                                                >
                                                    {c.name}
                                                </Link>
                                                <p className="font-mono text-[10px] text-gray-400">
                                                    Session: {c.session?.name}
                                                </p>
                                            </td>

                                            {/* Level & Stage */}
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-gray-800">{c.class_level?.name}</p>
                                                <span className="text-[10px] text-gray-500">
                                                    {c.class_level?.stage?.name}
                                                </span>
                                            </td>

                                            {/* Arm */}
                                            <td className="py-3.5 px-4">
                                                {c.arm ? (
                                                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-gray-100 text-gray-800 text-[11px]">
                                                        Arm {c.arm}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-gray-400 italic text-[11px] bg-gray-50 border border-gray-100">
                                                        No Arm
                                                    </span>
                                                )}
                                            </td>

                                            {/* Classroom */}
                                            <td className="py-3.5 px-4 text-gray-700">
                                                {c.classroom || <span className="text-gray-400 italic">Not assigned</span>}
                                            </td>

                                            {/* Capacity */}
                                            <td className="py-3.5 px-4 text-gray-600">
                                                {c.capacity || 35} seats
                                            </td>

                                            {/* Subjects count */}
                                            <td className="py-3.5 px-4">
                                                <Link
                                                    href={`/academic/classes/${c.id}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                >
                                                    <BookOpen className="w-3 h-3" />
                                                    <span>{c.subjects_count ?? 0} Subjects</span>
                                                </Link>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    c.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {c.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/academic/classes/${c.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-primary-600 hover:bg-gray-50 text-xs font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Details &amp; Subjects</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Pagination links={classes.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
