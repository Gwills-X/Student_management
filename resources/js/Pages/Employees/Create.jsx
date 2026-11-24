import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Building2,
    Calendar,
    Camera,
    Check,
    GraduationCap,
    Lock,
    Phone,
    Plus,
    Shield,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Create({
    categories = [],
    availableRoles = [],
    employmentTypes = [],
    employmentStatuses = [],
    genders = [],
}) {
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        // Personal
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        profile_photo: null,
        state_of_origin: '',
        lga: '',

        // Contact
        phone_number: '',
        alt_phone_number: '',
        email: '',
        residential_address: '',

        // Employment
        employee_category_id: categories.length > 0 ? categories[0].id : '',
        job_title: '',
        department: '',
        employment_type: 'Full-time',
        date_employed: new Date().toISOString().split('T')[0],
        employment_status: 'Active',

        // Additional
        qualifications: '',
        additional_notes: '',

        // Optional User Account
        create_account: false,
        account_username: '',
        account_password: '',
        account_role: availableRoles.length > 0 ? availableRoles[0] : '',
        account_is_active: true,
    });

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (file) {
            setData('profile_photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        post('/employees', {
            forceFormData: true,
        });
    }

    return (
        <AuthenticatedLayout title="Register Employee">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/employees"
                            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Register New Employee
                            </h1>
                            <p className="text-gray-500 text-xs mt-0.5">
                                Staff number will be automatically generated using format <span className="font-mono text-primary-600">STAFF/YYYY/0001</span>.
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
                                <div>
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-xs transition-colors">
                                        <Camera className="w-3.5 h-3.5" />
                                        <span>Upload Photograph</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-gray-400 mt-1">Optional. JPG, PNG or WEBP up to 2MB.</p>
                                    {errors.profile_photo && (
                                        <p className="text-xs text-red-600 mt-1">{errors.profile_photo}</p>
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
                                    placeholder="e.g. Samuel"
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                            </div>

                            {/* Middle Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Middle Name <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    placeholder="e.g. Adeleke"
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
                                    placeholder="e.g. Balogun"
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
                                {errors.date_of_birth && <p className="text-xs text-red-600 mt-1">{errors.date_of_birth}</p>}
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
                                    placeholder="e.g. Edo State"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* LGA */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Local Government Area (LGA)
                                </label>
                                <input
                                    type="text"
                                    value={data.lga}
                                    onChange={(e) => setData('lga', e.target.value)}
                                    placeholder="e.g. Oredo"
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
                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Primary Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    placeholder="e.g. 08012345678"
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
                                    placeholder="e.g. 08087654321"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g. staff@greenwood.edu"
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                                    placeholder="Full street address, city, and state"
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
                                {errors.employee_category_id && <p className="text-xs text-red-600 mt-1">{errors.employee_category_id}</p>}
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
                                    placeholder="e.g. Mathematics Teacher / School Accountant"
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.job_title ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                                    placeholder="e.g. Science / Bursary / Administration"
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
                                    className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.date_employed ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.date_employed && <p className="text-xs text-red-600 mt-1">{errors.date_employed}</p>}
                            </div>

                            {/* Employment Status */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Initial Status <span className="text-red-500">*</span>
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

                    {/* 4. Qualifications & Additional Notes */}
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
                                    Academic &amp; Professional Qualifications
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.qualifications}
                                    onChange={(e) => setData('qualifications', e.target.value)}
                                    placeholder="e.g. B.Sc. Mathematics (Unilag), PGDE, TRCN Certified..."
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
                                    placeholder="Internal administrative comments or references..."
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 5. Optional Immediate User Account Creation */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">System Login Account</h2>
                                    <p className="text-xs text-gray-500">
                                        An employee can exist without a login account. Enable only if this staff member needs portal access.
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.create_account}
                                    onChange={(e) => setData('create_account', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {data.create_account && (
                            <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                                {/* Username */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Login Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required={data.create_account}
                                        value={data.account_username}
                                        onChange={(e) => setData('account_username', e.target.value)}
                                        placeholder="Letters, numbers only"
                                        className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.account_username ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.account_username && (
                                        <p className="text-xs text-red-600 mt-1">{errors.account_username}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Initial Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required={data.create_account}
                                        value={data.account_password}
                                        onChange={(e) => setData('account_password', e.target.value)}
                                        placeholder="Min 8 characters"
                                        className={`w-full px-3 py-2 text-xs rounded-xl border ${errors.account_password ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.account_password && (
                                        <p className="text-xs text-red-600 mt-1">{errors.account_password}</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Assigned Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required={data.create_account}
                                        value={data.account_role}
                                        onChange={(e) => setData('account_role', e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {availableRoles.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    {errors.account_role && (
                                        <p className="text-xs text-red-600 mt-1">{errors.account_role}</p>
                                    )}
                                </div>

                                {/* Active Checkbox */}
                                <div className="md:col-span-3 flex items-center pt-1">
                                    <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.account_is_active}
                                            onChange={(e) => setData('account_is_active', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span>Account is Active immediately upon registration</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/employees"
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
                            <span>{processing ? 'Registering...' : 'Register Employee'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
