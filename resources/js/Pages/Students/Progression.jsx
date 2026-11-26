import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import { router, useForm } from "@inertiajs/react";
import { ArrowRight, CheckCircle2, GraduationCap, XCircle } from "lucide-react";
import { useState } from "react";

const field =
    "w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500";

export default function Progression({
    students,
    sessions,
    classes,
    classLevels,
    fromSessionId,
    toSessionId,
    progressedIds = [],
    filters = {},
}) {
    const [selected, setSelected] = useState([]);
    const [levelId, setLevelId] = useState("");

    const bulkForm = useForm({
        student_ids: [],
        from_academic_session_id: fromSessionId,
        academic_session_id: toSessionId,
        class_id: "",
        remarks: "",
    });

    function toggle(studentId) {
        setSelected((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId],
        );
    }

    function applySessionFilter(next) {
        router.get(
            "/students/progression",
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );
    }

    function submitBulk(e) {
        e.preventDefault();
        bulkForm.setData("student_ids", selected);
        // Slightly delayed so state settles before posting.
        setTimeout(() => {
            bulkForm.post("/students/progression/bulk", {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    bulkForm.reset();
                },
            });
        }, 0);
    }

    const availableClasses = classes.filter(
        (c) =>
            String(c.academic_session_id || c.session_id || "") ===
                String(toSessionId) &&
            (!levelId || String(c.class_level_id) === String(levelId)),
    );

    const enrolmentsOf = (student) =>
        (student.enrolments || []).find(
            (e) => String(e.academic_session_id) === String(fromSessionId),
        );

    return (
        <AuthenticatedLayout title="New Session Progression">
            <div className="max-w-7xl mx-auto space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        New Academic Session Enrolment
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Select students from a previous session and enrol them
                        into a new session. Progression decisions are made
                        manually by authorised personnel — no automatic
                        promotion.
                    </p>
                </div>

                {/* Session selectors */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 grid md:grid-cols-3 gap-3 shadow-xs">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                            From (previous session)
                        </label>
                        <select
                            value={fromSessionId || ""}
                            onChange={(e) =>
                                applySessionFilter({
                                    from_academic_session_id: e.target.value,
                                })
                            }
                            className={field}
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                    {s.is_current ? " (current)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                            To (new session)
                        </label>
                        <select
                            value={toSessionId || ""}
                            onChange={(e) =>
                                applySessionFilter({
                                    academic_session_id: e.target.value,
                                })
                            }
                            className={field}
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                    {s.is_current ? " (current)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                            Filter by class level (optional)
                        </label>
                        <select
                            value={levelId}
                            onChange={(e) => setLevelId(e.target.value)}
                            className={field}
                        >
                            <option value="">All levels</option>
                            {classLevels.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.stage?.name} — {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bulk enrolment form */}
                <form
                    onSubmit={submitBulk}
                    className="bg-white border border-primary-200 rounded-2xl p-4 grid md:grid-cols-4 gap-3 items-end shadow-xs"
                >
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                            Destination actual class ({availableClasses.length}{" "}
                            available)
                        </label>
                        <select
                            value={bulkForm.data.class_id}
                            onChange={(e) =>
                                bulkForm.setData("class_id", e.target.value)
                            }
                            className={field}
                            required
                        >
                            <option value="">Select destination class</option>
                            {availableClasses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                    {c.arm ? ` (Arm ${c.arm})` : " (No arm)"}
                                </option>
                            ))}
                        </select>
                        {availableClasses.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                                No active classes exist for the target session
                                and level yet. Create classes first in Academic
                                Setup.
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                            Remarks (optional)
                        </label>
                        <input
                            value={bulkForm.data.remarks}
                            onChange={(e) =>
                                bulkForm.setData("remarks", e.target.value)
                            }
                            className={field}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={selected.length === 0 || bulkForm.processing}
                        className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                        {bulkForm.processing
                            ? "Enrolling..."
                            : `Enrol Selected (${selected.length})`}
                    </button>
                </form>

                {/* Students table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {students.data.length === 0 ? (
                        <div className="text-center py-16">
                            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">
                                No students found
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                No students have enrolments in the selected
                                previous session.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4 w-8"></th>
                                        <th className="py-3 px-4">Student</th>
                                        <th className="py-3 px-4">
                                            Previous Class
                                        </th>
                                        <th className="py-3 px-4">
                                            Progression
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.data.map((student) => {
                                        const enrolment = enrolmentsOf(student);
                                        const alreadyProgressed =
                                            progressedIds.includes(student.id);
                                        return (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-gray-50/80"
                                            >
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(
                                                            student.id,
                                                        )}
                                                        onChange={() =>
                                                            toggle(student.id)
                                                        }
                                                        disabled={
                                                            alreadyProgressed
                                                        }
                                                        className="w-4 h-4 rounded border-gray-300 text-primary-600"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-gray-900">
                                                        {student.full_name}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-gray-500">
                                                        {
                                                            student.admission_number
                                                        }
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                    {enrolment?.schoolClass
                                                        ?.name || "—"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {alreadyProgressed ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Enrolled in new
                                                            session
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-gray-400">
                                                            <XCircle className="w-4 h-4" />
                                                            Not yet enrolled
                                                        </span>
                                                    )}
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
