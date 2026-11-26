import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { Link, router, useForm } from "@inertiajs/react";
import {
    Calendar,
    ClipboardList,
    FileText,
    History,
    IdCard,
    Mail,
    Phone,
    Repeat,
    ShieldCheck,
    Upload,
    User,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";

const field =
    "w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500";

function Row({ label, value }) {
    return (
        <div className="py-1.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {label}
            </p>
            <p className="text-sm text-gray-900 mt-0.5">{value ?? "—"}</p>
        </div>
    );
}

function Section({ icon: Icon, title, children, action = null }) {
    return (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-primary-600" />}{" "}
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function Show({
    student,
    isOwner,
    statuses,
    availableClasses = [],
    academicSessions = [],
    can,
}) {
    const [statusFormOpen, setStatusFormOpen] = useState(false);
    const [enrolFormOpen, setEnrolFormOpen] = useState(false);
    const [transferFormOpen, setTransferFormOpen] = useState(false);
    const [deleteDoc, setDeleteDoc] = useState(null);
    const [statusTarget, setStatusTarget] = useState(student.status);
    const [statusRemarks, setStatusRemarks] = useState("");
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);

    const statusForm = useForm({});
    const enrolForm = useForm({
        academic_session_id: student.academic_session_id,
        class_id: "",
        enrolment_date: new Date().toISOString().slice(0, 10),
        remarks: "",
    });
    const transferForm = useForm({
        academic_session_id: student.academic_session_id,
        to_class_id: "",
        transfer_date: new Date().toISOString().slice(0, 10),
        reason: "",
    });
    const documentForm = useForm({
        title: "",
        document_type: "Other",
        document_file: null,
    });
    const photoForm = useForm({ photo: null });

    const currentEnrolment = (student.enrolments || [])[0] || null;

    function submitStatus(e) {
        e.preventDefault();
        router.patch(
            `/students/${student.id}/status`,
            { status: statusTarget, remarks: statusRemarks },
            {
                onSuccess: () => setStatusFormOpen(false),
            },
        );
    }

    function submitEnrol(e) {
        e.preventDefault();
        enrolForm.post(`/students/${student.id}/enrol`, {
            onSuccess: () => setEnrolFormOpen(false),
        });
    }

    function submitTransfer(e) {
        e.preventDefault();
        transferForm.post(`/students/${student.id}/transfer`, {
            onSuccess: () => setTransferFormOpen(false),
        });
    }

    function submitDocument(e) {
        e.preventDefault();
        documentForm.post(`/students/${student.id}/documents`, {
            onSuccess: () => documentForm.reset(),
        });
    }

    function removeDocument() {
        if (!deleteDoc) return;
        router.delete(`/students/${student.id}/documents/${deleteDoc.id}`, {
            onSuccess: () => setDeleteDoc(null),
        });
    }

    return (
        <AuthenticatedLayout title={`Student: ${student.full_name}`}>
            <div className="max-w-7xl mx-auto space-y-5">
                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {student.photo_url ? (
                            <img
                                src={student.photo_url}
                                alt={student.full_name}
                                className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xl border border-primary-200">
                                {(student.full_name || "S").charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {student.full_name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {student.admission_number} · @
                                {student.user?.username} · {student.status}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can["students.edit"] && (
                            <Link
                                href={`/students/${student.id}/edit`}
                                className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
                            >
                                Edit Information
                            </Link>
                        )}
                        {can["students.change_status"] && (
                            <button
                                onClick={() => setStatusFormOpen(true)}
                                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Change Status
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Personal information */}
                        <Section icon={User} title="Personal Information">
                            <div className="grid md:grid-cols-3 gap-x-6">
                                <Row
                                    label="Full Name"
                                    value={student.full_name}
                                />
                                <Row label="Gender" value={student.gender} />
                                <Row
                                    label="Date of Birth"
                                    value={student.date_of_birth}
                                />
                                <Row
                                    label="Nationality"
                                    value={student.nationality}
                                />
                                <Row
                                    label="State of Origin"
                                    value={student.state_of_origin}
                                />
                                <Row label="LGA" value={student.lga} />
                                <Row
                                    label="Phone"
                                    value={student.phone_number}
                                />
                                <Row
                                    label="Email"
                                    value={student.personal_email}
                                />
                                <Row
                                    label="Blood Group"
                                    value={student.blood_group}
                                />
                                <Row
                                    label="Genotype"
                                    value={student.genotype}
                                />
                                <Row
                                    label="Medical Conditions"
                                    value={student.medical_conditions}
                                />
                                <Row
                                    label="Residential Address"
                                    value={student.residential_address}
                                />
                            </div>
                        </Section>

                        {/* Admission information */}
                        <Section icon={IdCard} title="Admission Information">
                            <div className="grid md:grid-cols-3 gap-x-6">
                                <Row
                                    label="Admission Number"
                                    value={student.admission_number}
                                />
                                <Row
                                    label="Admission Date"
                                    value={student.admission_date}
                                />
                                <Row
                                    label="Admission Session"
                                    value={student.academicSession?.name}
                                />
                                <Row
                                    label="Original Class Level"
                                    value={student.classLevel?.name}
                                />
                                <Row
                                    label="Education Stage"
                                    value={student.stage?.name}
                                />
                                <Row
                                    label="Application Reference"
                                    value={
                                        student.application ? (
                                            <Link
                                                href={`/admissions/applications/${student.application.id}`}
                                                className="text-primary-700 font-semibold hover:underline"
                                            >
                                                {
                                                    student.application
                                                        .application_number
                                                }
                                            </Link>
                                        ) : null
                                    }
                                />
                                <Row
                                    label="Decision Remarks"
                                    value={
                                        student.application?.decision_remarks
                                    }
                                />
                            </div>
                        </Section>

                        {/* Guardian / emergency contact */}
                        <Section
                            icon={Users}
                            title="Guardian & Emergency Contact"
                        >
                            <div className="grid md:grid-cols-3 gap-x-6">
                                <Row
                                    label="Guardian Name"
                                    value={student.guardian_name}
                                />
                                <Row
                                    label="Relationship"
                                    value={student.guardian_relationship}
                                />
                                <Row
                                    label="Guardian Phone"
                                    value={student.guardian_phone}
                                />
                                <Row
                                    label="Guardian Email"
                                    value={student.guardian_email}
                                />
                                <Row
                                    label="Guardian Address"
                                    value={student.guardian_address}
                                />
                                <Row
                                    label="Emergency Contact"
                                    value={student.emergency_contact_name}
                                />
                                <Row
                                    label="Emergency Phone"
                                    value={student.emergency_contact_phone}
                                />
                                <Row
                                    label="Emergency Relationship"
                                    value={
                                        student.emergency_contact_relationship
                                    }
                                />
                            </div>
                        </Section>

                        {/* Academic information */}
                        <Section
                            icon={ClipboardList}
                            title="Academic Information & Enrolment History"
                            action={
                                can["students.enrol"] && (
                                    <button
                                        onClick={() => setEnrolFormOpen(true)}
                                        className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold"
                                    >
                                        Enrol
                                    </button>
                                )
                            }
                        >
                            <div className="grid md:grid-cols-3 gap-x-6 mb-4 pb-4 border-b border-gray-100">
                                <Row
                                    label="Current Session"
                                    value={
                                        currentEnrolment?.session?.name ||
                                        student.academicSession?.name
                                    }
                                />
                                <Row
                                    label="Current Class"
                                    value={currentEnrolment?.schoolClass?.name}
                                />
                                <Row
                                    label="Enrolment Status"
                                    value={currentEnrolment?.status}
                                />
                            </div>
                            {(student.enrolments || []).length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No enrolment records yet. This student has
                                    not been placed in an actual class.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {student.enrolments.map((enrolment) => (
                                        <div
                                            key={enrolment.id}
                                            className="border border-gray-100 rounded-xl px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {enrolment.schoolClass
                                                        ?.name ||
                                                        enrolment.classLevel
                                                            ?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {enrolment.session?.name} ·
                                                    Enrolled{" "}
                                                    {enrolment.enrolment_date}
                                                    {enrolment.enrolledBy
                                                        ? ` by ${enrolment.enrolledBy.name}`
                                                        : ""}
                                                    {enrolment.remarks
                                                        ? ` · ${enrolment.remarks}`
                                                        : ""}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                    enrolment.status ===
                                                    "Active"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-gray-100 text-gray-700 border-gray-200"
                                                }`}
                                            >
                                                {enrolment.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>

                        {/* Transfer history */}
                        <Section
                            icon={Repeat}
                            title="Class Transfer History"
                            action={
                                can["students.transfer"] &&
                                currentEnrolment?.status === "Active" && (
                                    <button
                                        onClick={() =>
                                            setTransferFormOpen(true)
                                        }
                                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold"
                                    >
                                        Transfer Class
                                    </button>
                                )
                            }
                        >
                            {(student.transfer_histories || []).length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No class transfers recorded.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {student.transfer_histories.map(
                                        (transfer) => (
                                            <div
                                                key={transfer.id}
                                                className="border border-gray-100 rounded-xl px-4 py-3 text-sm flex justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {transfer.fromClass
                                                            ?.name || "—"}{" "}
                                                        →{" "}
                                                        {transfer.toClass
                                                            ?.name || "—"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {transfer.transfer_date}
                                                        {transfer.transferredBy
                                                            ? ` · by ${transfer.transferredBy.name}`
                                                            : ""}
                                                        {transfer.reason
                                                            ? ` · ${transfer.reason}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </Section>
                    </div>

                    <aside className="space-y-5">
                        {/* Account information */}
                        <Section icon={ShieldCheck} title="Account Information">
                            <div className="space-y-1">
                                <Row
                                    label="Username"
                                    value={`@${student.user?.username}`}
                                />
                                <Row
                                    label="Email"
                                    value={student.user?.email}
                                />
                                <Row
                                    label="Account Status"
                                    value={
                                        <span
                                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                student.user?.is_active
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                            }`}
                                        >
                                            {student.user?.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    }
                                />
                                <p className="text-[11px] text-gray-400 mt-2">
                                    Account status is independent of the
                                    student's lifecycle status.
                                </p>
                            </div>
                        </Section>

                        {/* Documents */}
                        <Section
                            icon={FileText}
                            title="Documents"
                            action={
                                can["students.manage_documents"] && (
                                    <button
                                        onClick={() =>
                                            setShowPhotoUpload(!showPhotoUpload)
                                        }
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold"
                                    >
                                        <Upload className="w-3.5 h-3.5" />{" "}
                                        Upload
                                    </button>
                                )
                            }
                        >
                            {can["students.manage_documents"] &&
                                showPhotoUpload && (
                                    <form
                                        onSubmit={submitDocument}
                                        className="space-y-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                    >
                                        <input
                                            value={documentForm.data.title}
                                            onChange={(e) =>
                                                documentForm.setData(
                                                    "title",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Document title"
                                            className={field}
                                            required
                                        />
                                        <select
                                            value={
                                                documentForm.data.document_type
                                            }
                                            onChange={(e) =>
                                                documentForm.setData(
                                                    "document_type",
                                                    e.target.value,
                                                )
                                            }
                                            className={field}
                                        >
                                            {[
                                                "Updated Passport Photograph",
                                                "Transfer Certificate",
                                                "Medical Report",
                                                "Birth Certificate",
                                                "Identification",
                                                "Other",
                                            ].map((t) => (
                                                <option key={t}>{t}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                            onChange={(e) =>
                                                documentForm.setData(
                                                    "document_file",
                                                    e.target.files[0],
                                                )
                                            }
                                            className={field}
                                            required
                                        />
                                        {documentForm.errors.document_file && (
                                            <p className="text-xs text-red-600">
                                                {
                                                    documentForm.errors
                                                        .document_file
                                                }
                                            </p>
                                        )}
                                        <button
                                            disabled={documentForm.processing}
                                            className="w-full px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold"
                                        >
                                            Upload Document
                                        </button>
                                    </form>
                                )}
                            {(student.documents || []).length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No documents uploaded.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {student.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 text-sm"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {doc.title}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {doc.document_type} ·{" "}
                                                    {doc.formatted_size || ""}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <a
                                                    href={`/students/${student.id}/documents/${doc.id}/view`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary-600 font-semibold text-xs"
                                                >
                                                    View
                                                </a>
                                                <a
                                                    href={`/students/${student.id}/documents/${doc.id}/download`}
                                                    className="text-primary-600 font-semibold text-xs"
                                                >
                                                    Download
                                                </a>
                                                {can[
                                                    "students.manage_documents"
                                                ] && (
                                                    <button
                                                        onClick={() =>
                                                            setDeleteDoc(doc)
                                                        }
                                                        className="text-red-500 text-xs font-semibold"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>

                        {/* Status history */}
                        {can["students.view_history"] && (
                            <Section icon={History} title="Status History">
                                {(student.status_histories || []).length ===
                                0 ? (
                                    <p className="text-sm text-gray-500">
                                        No status changes recorded.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {student.status_histories.map(
                                            (history) => (
                                                <div
                                                    key={history.id}
                                                    className="border-l-2 border-primary-300 pl-3 text-xs"
                                                >
                                                    <p className="font-semibold text-gray-800">
                                                        {history.from_status ||
                                                            "Start"}{" "}
                                                        → {history.to_status}
                                                    </p>
                                                    {history.remarks && (
                                                        <p className="text-gray-500 mt-1">
                                                            {history.remarks}
                                                        </p>
                                                    )}
                                                    <p className="text-gray-400 mt-1">
                                                        {history.changed_at}
                                                        {history.changer
                                                            ? ` · ${history.changer.name}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </Section>
                        )}
                    </aside>
                </div>

                {/* Status modal */}
                {statusFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setStatusFormOpen(false)}
                        />
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold">
                                    Change Student Status
                                </h3>
                                <button
                                    onClick={() => setStatusFormOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={submitStatus}
                                className="mt-4 space-y-3"
                            >
                                <select
                                    value={statusTarget}
                                    onChange={(e) =>
                                        setStatusTarget(e.target.value)
                                    }
                                    className={field}
                                >
                                    {statuses.map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                                <textarea
                                    value={statusRemarks}
                                    onChange={(e) =>
                                        setStatusRemarks(e.target.value)
                                    }
                                    placeholder="Remarks (reason for the change)"
                                    className={`${field} h-24`}
                                />
                                {statusForm.errors.status && (
                                    <p className="text-xs text-red-600">
                                        {statusForm.errors.status}
                                    </p>
                                )}
                                <button className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold">
                                    Change Status
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Enrol modal */}
                {enrolFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setEnrolFormOpen(false)}
                        />
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold">
                                    Enrol Student
                                </h3>
                                <button
                                    onClick={() => setEnrolFormOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={submitEnrol}
                                className="mt-4 space-y-3"
                            >
                                <select
                                    value={enrolForm.data.academic_session_id}
                                    onChange={(e) =>
                                        enrolForm.setData(
                                            "academic_session_id",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                    required
                                >
                                    <option value="">
                                        Select academic session
                                    </option>
                                    {academicSessions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={enrolForm.data.class_id}
                                    onChange={(e) =>
                                        enrolForm.setData(
                                            "class_id",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                    required
                                >
                                    <option value="">
                                        Select actual class
                                    </option>
                                    {availableClasses
                                        .filter(
                                            (c) =>
                                                String(c.class_level_id) ===
                                                String(student.class_level_id),
                                        )
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                                {c.arm
                                                    ? ` (Arm ${c.arm})`
                                                    : " (No arm)"}
                                            </option>
                                        ))}
                                </select>
                                <p className="text-[11px] text-gray-500">
                                    Only actual classes for the admission level
                                    ({student.classLevel?.name}) in the selected
                                    session are shown.
                                </p>
                                <input
                                    type="date"
                                    value={enrolForm.data.enrolment_date}
                                    onChange={(e) =>
                                        enrolForm.setData(
                                            "enrolment_date",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                                <textarea
                                    value={enrolForm.data.remarks}
                                    onChange={(e) =>
                                        enrolForm.setData(
                                            "remarks",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Remarks"
                                    className={`${field} h-20`}
                                />
                                {enrolForm.errors.class_id && (
                                    <p className="text-xs text-red-600">
                                        {enrolForm.errors.class_id}
                                    </p>
                                )}
                                <button
                                    disabled={enrolForm.processing}
                                    className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold"
                                >
                                    Enrol Student
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Transfer modal */}
                {transferFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
                            onClick={() => setTransferFormOpen(false)}
                        />
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold">
                                    Transfer Class
                                </h3>
                                <button
                                    onClick={() => setTransferFormOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={submitTransfer}
                                className="mt-4 space-y-3"
                            >
                                <p className="text-sm text-gray-600">
                                    Current class:{" "}
                                    <b>
                                        {currentEnrolment?.schoolClass?.name ||
                                            "—"}
                                    </b>
                                </p>
                                <select
                                    value={transferForm.data.to_class_id}
                                    onChange={(e) =>
                                        transferForm.setData(
                                            "to_class_id",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                    required
                                >
                                    <option value="">
                                        Select destination class
                                    </option>
                                    {availableClasses
                                        .filter(
                                            (c) =>
                                                String(c.id) !==
                                                String(
                                                    currentEnrolment?.class_id,
                                                ),
                                        )
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                                {c.arm
                                                    ? ` (Arm ${c.arm})`
                                                    : " (No arm)"}
                                            </option>
                                        ))}
                                </select>
                                <input
                                    type="date"
                                    value={transferForm.data.transfer_date}
                                    onChange={(e) =>
                                        transferForm.setData(
                                            "transfer_date",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                                <textarea
                                    value={transferForm.data.reason}
                                    onChange={(e) =>
                                        transferForm.setData(
                                            "reason",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Reason for transfer"
                                    className={`${field} h-20`}
                                />
                                {transferForm.errors.to_class_id && (
                                    <p className="text-xs text-red-600">
                                        {transferForm.errors.to_class_id}
                                    </p>
                                )}
                                <button
                                    disabled={transferForm.processing}
                                    className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold"
                                >
                                    Transfer Student
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <ConfirmationModal
                    isOpen={Boolean(deleteDoc)}
                    title="Remove Document"
                    message={`Are you sure you want to permanently remove "${deleteDoc?.title}" from this student's record?`}
                    confirmText="Delete Document"
                    isDanger={true}
                    onConfirm={removeDocument}
                    onClose={() => setDeleteDoc(null)}
                />
            </div>
        </AuthenticatedLayout>
    );
}
