import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import { useState } from "react";

const field =
    "w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

function Label({ children }) {
    return (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            {children}
        </label>
    );
}

export default function Edit({ student }) {
    const form = useForm({
        date_of_birth: student.date_of_birth || "",
        gender: student.gender || "",
        nationality: student.nationality || "",
        state_of_origin: student.state_of_origin || "",
        lga: student.lga || "",
        residential_address: student.residential_address || "",
        phone_number: student.phone_number || "",
        personal_email: student.personal_email || "",
        blood_group: student.blood_group || "",
        genotype: student.genotype || "",
        medical_conditions: student.medical_conditions || "",
        guardian_name: student.guardian_name || "",
        guardian_relationship: student.guardian_relationship || "",
        guardian_phone: student.guardian_phone || "",
        guardian_email: student.guardian_email || "",
        guardian_address: student.guardian_address || "",
        emergency_contact_name: student.emergency_contact_name || "",
        emergency_contact_phone: student.emergency_contact_phone || "",
        emergency_contact_relationship:
            student.emergency_contact_relationship || "",
        photo: null,
    });

    function submit(e) {
        e.preventDefault();
        form.put(`/students/${student.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout title={`Edit Student: ${student.full_name}`}>
            <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Edit Student Information
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {student.full_name} · {student.admission_number}.
                            Permanent admission details are not editable here.
                        </p>
                    </div>
                    <Link
                        href={`/students/${student.id}`}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Back to Profile
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <h2 className="font-bold text-gray-900">
                            Personal Information
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label>Date of Birth</Label>
                                <input
                                    type="date"
                                    value={form.data.date_of_birth}
                                    onChange={(e) =>
                                        form.setData(
                                            "date_of_birth",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Gender</Label>
                                <select
                                    value={form.data.gender}
                                    onChange={(e) =>
                                        form.setData("gender", e.target.value)
                                    }
                                    className={field}
                                >
                                    <option value="">—</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <Label>Passport Photograph</Label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) =>
                                        form.setData("photo", e.target.files[0])
                                    }
                                    className={field}
                                />
                                {form.errors.photo && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {form.errors.photo}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Nationality</Label>
                                <input
                                    value={form.data.nationality}
                                    onChange={(e) =>
                                        form.setData(
                                            "nationality",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>State of Origin</Label>
                                <input
                                    value={form.data.state_of_origin}
                                    onChange={(e) =>
                                        form.setData(
                                            "state_of_origin",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>LGA</Label>
                                <input
                                    value={form.data.lga}
                                    onChange={(e) =>
                                        form.setData("lga", e.target.value)
                                    }
                                    className={field}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Residential Address</Label>
                                <textarea
                                    value={form.data.residential_address}
                                    onChange={(e) =>
                                        form.setData(
                                            "residential_address",
                                            e.target.value,
                                        )
                                    }
                                    className={`${field} h-20`}
                                />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <input
                                    value={form.data.phone_number}
                                    onChange={(e) =>
                                        form.setData(
                                            "phone_number",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Personal Email</Label>
                                <input
                                    type="email"
                                    value={form.data.personal_email}
                                    onChange={(e) =>
                                        form.setData(
                                            "personal_email",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Blood Group</Label>
                                <input
                                    value={form.data.blood_group}
                                    onChange={(e) =>
                                        form.setData(
                                            "blood_group",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Genotype</Label>
                                <input
                                    value={form.data.genotype}
                                    onChange={(e) =>
                                        form.setData("genotype", e.target.value)
                                    }
                                    className={field}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <Label>Medical Conditions</Label>
                                <textarea
                                    value={form.data.medical_conditions}
                                    onChange={(e) =>
                                        form.setData(
                                            "medical_conditions",
                                            e.target.value,
                                        )
                                    }
                                    className={`${field} h-20`}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <h2 className="font-bold text-gray-900">
                            Guardian & Emergency Contact
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label>Guardian Name</Label>
                                <input
                                    value={form.data.guardian_name}
                                    onChange={(e) =>
                                        form.setData(
                                            "guardian_name",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Relationship</Label>
                                <input
                                    value={form.data.guardian_relationship}
                                    onChange={(e) =>
                                        form.setData(
                                            "guardian_relationship",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Guardian Phone</Label>
                                <input
                                    value={form.data.guardian_phone}
                                    onChange={(e) =>
                                        form.setData(
                                            "guardian_phone",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Guardian Email</Label>
                                <input
                                    type="email"
                                    value={form.data.guardian_email}
                                    onChange={(e) =>
                                        form.setData(
                                            "guardian_email",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Guardian Address</Label>
                                <textarea
                                    value={form.data.guardian_address}
                                    onChange={(e) =>
                                        form.setData(
                                            "guardian_address",
                                            e.target.value,
                                        )
                                    }
                                    className={`${field} h-20`}
                                />
                            </div>
                            <div>
                                <Label>Emergency Contact Name</Label>
                                <input
                                    value={form.data.emergency_contact_name}
                                    onChange={(e) =>
                                        form.setData(
                                            "emergency_contact_name",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Emergency Contact Phone</Label>
                                <input
                                    value={form.data.emergency_contact_phone}
                                    onChange={(e) =>
                                        form.setData(
                                            "emergency_contact_phone",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                            <div>
                                <Label>Emergency Relationship</Label>
                                <input
                                    value={
                                        form.data.emergency_contact_relationship
                                    }
                                    onChange={(e) =>
                                        form.setData(
                                            "emergency_contact_relationship",
                                            e.target.value,
                                        )
                                    }
                                    className={field}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs disabled:opacity-50"
                        >
                            {form.processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
