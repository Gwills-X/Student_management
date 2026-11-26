import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import { Link, router } from "@inertiajs/react";
import { GraduationCap, RotateCcw, Search, Users } from "lucide-react";
import { useState } from "react";

export default function ClassList({
    class: schoolClass,
    enrolments,
    filters = {},
    statuses = [],
}) {
    const [search, setSearch] = useState(filters.search || "");

    function applyFilters(next) {
        router.get(
            `/academic/classes/${schoolClass.id}/students`,
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AuthenticatedLayout title={`Students: ${schoolClass.name}`}>
            <div className="max-w-7xl mx-auto space-y-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {schoolClass.name}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {schoolClass.class_level?.stage?.name} ·{" "}
                                {schoolClass.class_level?.name} ·{" "}
                                {schoolClass.session?.name}
                                {schoolClass.session?.is_current
                                    ? " (current session)"
                                    : ""}
                                {schoolClass.arm
                                    ? ` · Arm ${schoolClass.arm}`
                                    : " · No arm"}
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200">
                            <Users className="w-4 h-4" /> {enrolments.total}{" "}
                            enrolled
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && applyFilters({ search })
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
                        <option value="">All enrolment statuses</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setSearch("");
                            applyFilters({ search: "", status: "" });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {enrolments.data.length === 0 ? (
                        <div className="text-center py-16">
                            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">
                                No students in this class
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                No enrolments matched this class and filters.
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
                                        <th className="py-3 px-4">
                                            Enrolment Status
                                        </th>
                                        <th className="py-3 px-4">
                                            Enrolled On
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {enrolments.data.map((enrolment) => {
                                        const student = enrolment.student;
                                        return (
                                            <tr
                                                key={enrolment.id}
                                                className="hover:bg-gray-50/80"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {student?.photo_url ? (
                                                            <img
                                                                src={
                                                                    student.photo_url
                                                                }
                                                                alt=""
                                                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center border border-primary-200">
                                                                {(
                                                                    student?.full_name ||
                                                                    "S"
                                                                ).charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Link
                                                                href={`/students/${student?.id}`}
                                                                className="font-bold text-gray-900 hover:text-primary-600"
                                                            >
                                                                {
                                                                    student?.full_name
                                                                }
                                                            </Link>
                                                            <p className="text-[11px] text-gray-400">
                                                                @
                                                                {
                                                                    student
                                                                        ?.user
                                                                        ?.username
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-700">
                                                    {student?.admission_number}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                                            enrolment.status ===
                                                            "Active"
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-gray-100 text-gray-700 border-gray-200"
                                                        }`}
                                                    >
                                                        {enrolment.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {enrolment.enrolment_date}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination links={enrolments.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
