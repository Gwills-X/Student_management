import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import { Link, router } from "@inertiajs/react";
import { Filter, GraduationCap, RotateCcw, Search } from "lucide-react";
import { useState } from "react";

export default function Index({
    students,
    filters = {},
    statuses = [],
    sessions = [],
    stages = [],
    classLevels = [],
    classes = [],
    can = {},
}) {
    const [search, setSearch] = useState(filters.search || "");

    function applyFilters(next) {
        router.get(
            "/students",
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );
    }

    function handleReset() {
        setSearch("");
        router.get("/students", {}, { replace: true });
    }

    function enrolmentFor(student) {
        const sessionId = filters.academic_session_id;
        const list = student.enrolments || [];
        return sessionId
            ? list.find(
                  (e) => String(e.academic_session_id) === String(sessionId),
              ) || null
            : list[0] || null;
    }

    return (
        <AuthenticatedLayout title="Student Directory">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Student Directory
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Permanent student records. Students enter the system
                        only through the approved admission process.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    applyFilters({ search })
                                }
                                placeholder="Search name, admission no, username..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                applyFilters({ status: e.target.value })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.academic_session_id || ""}
                            onChange={(e) =>
                                applyFilters({
                                    academic_session_id: e.target.value,
                                })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        >
                            <option value="">All Sessions</option>
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.education_stage_id || ""}
                            onChange={(e) =>
                                applyFilters({
                                    education_stage_id: e.target.value,
                                })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        >
                            <option value="">All Stages</option>
                            {stages.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.class_level_id || ""}
                            onChange={(e) =>
                                applyFilters({ class_level_id: e.target.value })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        >
                            <option value="">All Levels</option>
                            {classLevels.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.stage?.name} — {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3">
                        <select
                            value={filters.class_id || ""}
                            onChange={(e) =>
                                applyFilters({ class_id: e.target.value })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        >
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.sort || "recent"}
                            onChange={(e) =>
                                applyFilters({ sort: e.target.value })
                            }
                            className="px-3 py-2 rounded-xl border border-gray-300 text-xs"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="name">Sort by Admission No</option>
                        </select>
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                        <button
                            onClick={() => applyFilters({ search })}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 text-xs font-semibold text-white hover:bg-primary-700"
                        >
                            <Filter className="w-3.5 h-3.5" /> Apply
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {students.data.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">
                                No students found
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                No student records matched your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4">
                                            Admission No
                                        </th>
                                        <th className="py-3 px-4">Username</th>
                                        <th className="py-3 px-4">
                                            Stage / Level
                                        </th>
                                        <th className="py-3 px-4">Class</th>
                                        <th className="py-3 px-4">Session</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {students.data.map((student) => {
                                        const enrolment = enrolmentFor(student);
                                        return (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-gray-50/80 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {student.photo_url ? (
                                                            <img
                                                                src={
                                                                    student.photo_url
                                                                }
                                                                alt={
                                                                    student.full_name
                                                                }
                                                                className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center border border-primary-200">
                                                                {(
                                                                    student.full_name ||
                                                                    "S"
                                                                ).charAt(0)}
                                                            </div>
                                                        )}
                                                        <Link
                                                            href={`/students/${student.id}`}
                                                            className="font-bold text-gray-900 hover:text-primary-600"
                                                        >
                                                            {student.full_name}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-700">
                                                    {student.admission_number}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    @{student.user?.username}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {student.stage?.name} /{" "}
                                                    {student.classLevel?.name}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {enrolment?.schoolClass
                                                        ?.name || "—"}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {enrolment?.session?.name ||
                                                        "—"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                                            student.status ===
                                                            "Active"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-gray-100 text-gray-700 border-gray-200"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${student.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`}
                                                        />
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination links={students.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
