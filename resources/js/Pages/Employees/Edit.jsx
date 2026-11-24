import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Building2,
    Camera,
    Check,
    GraduationCap,
    Phone,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';

export default function Edit({
    employee,
    categories = [],
    employmentTypes = [],
    employmentStatuses = [],
    genders = [],
}) {
    const [photoPreview, setPhotoPreview] = useState(employee.profile_photo_url || null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST', // Sent as POST with form-data
        first_name: employee.first_name || '',
        middle_name: employee.middle_name || '',
        last_name: employee.last_name || '',
        date_of_birth: employee.date_of_birth || '',
        gender: employee.gender || '',
        profile_photo: null,
        remove_photo: false,
        state_of_origin: employee.state_of_origin || '',
        lga: employee.lga || '',

        // Contact
        phone_number: employee.phone_number || '',
        alt_phone_number: employee.alt_phone_number || '',
        email: employee.email || '',
        residential_address: employee.residential_address || '',

        // Employment
        employee_category_id: employee.employee_category_id || (categories[0]?.id ?? ''),
        job_title: employee.job_title || '',
        department: employee.department || '',
        employment_type: employee.employment_type || 'Full-time',
        date_employed: employee.date_employed || '',
        employment_status: employee.employment_status || 'Active',

        // Additional
        qualifications: employee.qualifications || '',
        additional_notes: employee.additional_notes || '',
    });

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (file) {
            setData('profile_photo', file);
            setData('remove_photo', false);
            setPhotoPreview(URL.createObjectURL(file));
        }
    }

    function handleRemovePhoto() {
        setData('profile_photo', null);
        setData('remove_photo', true);
        setPhotoPreview(null);
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(`/employees/${employee.id}`, {
            forceFormData: true,
        });
    }

    return (
        <AuthenticatedLayout title={`Edit ${employee.full_name}`}>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/employees/${employee.id}`}
                            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Edit Employee Details
                                </h1>
                                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold border">
                                    {employee.employee_number}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">
                                Permanent staff number cannot be modified.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form container */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Personal Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <User className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Photo Picker */}
                            <div className="md:col-span-3 flex items-center gap-5 pb-2">
                                <div className="relative w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-xs transition-colors">
                                            <Camera className="w-3.5 h-3.5" />
                                            <span>Change Photograph</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Remove</span>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-400">JPG, PNG or WEBP up to 2MB.</p>
                                    {errors.profile_photo && (
                                        <p className="text-xs text-red-600">{errors.profile_photo}</p>
                                    )}
                                </div>
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                            </div>

                            {/* Middle Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.last_name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select Gender</option>
                                    {genders.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            {/* State of Origin */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    State of Origin
                                </label>
                                <input
                                    type="text"
                                    value={data.state_of_origin}
                                    onChange={(e) => setData('state_of_origin', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* LGA */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    LGA
                                </label>
                                <input
                                    type="text"
                                    value={data.lga}
                                    onChange={(e) => setData('lga', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Contact Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Phone className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Contact Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Primary Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.phone_number ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.phone_number && <p className="text-xs text-red-600 mt-1">{errors.phone_number}</p>}
                            </div>

                            {/* Alt Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Alternative Phone
                                </label>
                                <input
                                    type="tel"
                                    value={data.alt_phone_number}
                                    onChange={(e) => setData('alt_phone_number', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>

                            {/* Residential Address */}
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Residential Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={data.residential_address}
                                    onChange={(e) => setData('residential_address', e.target.value)}
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.residential_address ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.residential_address && <p className="text-xs text-red-600 mt-1">{errors.residential_address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 3. Employment Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Employment Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Category */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Employee Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.employee_category_id}
                                    onChange={(e) => setData('employee_category_id', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Title */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.job_title}
                                    onChange={(e) => setData('job_title', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {errors.job_title && <p className="text-xs text-red-600 mt-1">{errors.job_title}</p>}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Employment Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Employment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.employment_type}
                                    onChange={(e) => setData('employment_type', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {employmentTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Employed */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Date Employed <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={data.date_employed}
                                    onChange={(e) => setData('date_employed', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Employment Status */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Employment Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.employment_status}
                                    onChange={(e) => setData('employment_status', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {employmentStatuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 4. Qualifications & Notes */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Qualifications &amp; Notes</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Qualifications
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.qualifications}
                                    onChange={(e) => setData('qualifications', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Additional Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.additional_notes}
                                    onChange={(e) => setData('additional_notes', e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={`/employees/${employee.id}`}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            <span>{processing ? 'Saving Changes...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
