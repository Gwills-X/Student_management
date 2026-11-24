import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmationModal from '@/Components/ConfirmationModal';
import RoleBadge from '@/Components/RoleBadge';
import StatusBadge from '@/Components/StatusBadge';
import { Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileCheck,
    FileText,
    GraduationCap,
    KeyRound,
    Lock,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Shield,
    Trash2,
    Unlink,
    Upload,
    User,
    UserCheck,
    UserCog,
    UserMinus,
    Users,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({
    employee,
    availableRoles = [],
    unlinkedUsers = [],
    employmentStatuses = [],
    documentTypes = [],
}) {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'account' | 'documents'

    // Modal states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
    const [linkAccountModalOpen, setLinkAccountModalOpen] = useState(false);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);

    // Confirmation modal states
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDanger: false,
        onConfirm: () => {},
    });

    // ── Form: Update Employment Status ─────────────────────────────────────
    const statusForm = useForm({
        employment_status: employee.employment_status,
        status_note: '',
    });

    function handleStatusSubmit(e) {
        e.preventDefault();
        statusForm.patch(`/employees/${employee.id}/status`, {
            onSuccess: () => setStatusModalOpen(false),
        });
    }

    // ── Form: Create User Account ──────────────────────────────────────────
    const accountForm = useForm({
        username: '',
        email: employee.email || '',
        password: '',
        password_confirmation: '',
        role: availableRoles.length > 0 ? availableRoles[0] : '',
        is_active: true,
    });

    function handleAccountSubmit(e) {
        e.preventDefault();
        accountForm.post(`/employees/${employee.id}/account`, {
            onSuccess: () => {
                setCreateAccountModalOpen(false);
                accountForm.reset();
            },
        });
    }

    // ── Form: Link Existing User ───────────────────────────────────────────
    const linkForm = useForm({
        user_id: unlinkedUsers.length > 0 ? unlinkedUsers[0].id : '',
    });

    function handleLinkSubmit(e) {
        e.preventDefault();
        linkForm.post(`/employees/${employee.id}/account/link`, {
            onSuccess: () => setLinkAccountModalOpen(false),
        });
    }

    // ── Form: Reset Password ───────────────────────────────────────────────
    const resetPasswordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    function handleResetPasswordSubmit(e) {
        e.preventDefault();
        resetPasswordForm.post(`/employees/${employee.id}/account/reset-password`, {
            onSuccess: () => {
                setResetPasswordModalOpen(false);
                resetPasswordForm.reset();
            },
        });
    }

    // ── Form: Upload Document ──────────────────────────────────────────────
    const docForm = useForm({
        title: '',
        document_type: documentTypes.length > 0 ? documentTypes[0] : 'Academic Certificate',
        document_file: null,
    });

    function handleDocSubmit(e) {
        e.preventDefault();
        docForm.post(`/employees/${employee.id}/documents`, {
            forceFormData: true,
            onSuccess: () => {
                setUploadDocModalOpen(false);
                docForm.reset();
            },
        });
    }

    // ── Confirmation Actions ───────────────────────────────────────────────
    function triggerToggleAccountActive() {
        const action = employee.user?.is_active ? 'deactivate' : 'activate';
        setConfirmModal({
            isOpen: true,
            title: `${action === 'deactivate' ? 'Deactivate' : 'Activate'} User Account`,
            message: `Are you sure you want to ${action} login access for @${employee.user?.username}? The employee record will remain completely intact.`,
            confirmText: action === 'deactivate' ? 'Deactivate Account' : 'Activate Account',
            isDanger: action === 'deactivate',
            onConfirm: () => {
                router.patch(`/employees/${employee.id}/account/toggle-active`, {}, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    function triggerUnlinkAccount() {
        setConfirmModal({
            isOpen: true,
            title: 'Unlink User Account',
            message: `Are you sure you want to unlink @${employee.user?.username} from ${employee.full_name}? The user login account will remain available in the system as a standalone account.`,
            confirmText: 'Unlink Account',
            isDanger: true,
            onConfirm: () => {
                router.delete(`/employees/${employee.id}/account/unlink`, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    function triggerDeleteDocument(doc) {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Document',
            message: `Are you sure you want to delete '${doc.title}' (${doc.file_name})? This file will be permanently removed from storage.`,
            confirmText: 'Delete Document',
            isDanger: true,
            onConfirm: () => {
                router.delete(`/employees/${employee.id}/documents/${doc.id}`, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    return (
        <AuthenticatedLayout title={`${employee.full_name} (${employee.employee_number})`}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Link */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/employees"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Employee Directory</span>
                    </Link>
                </div>

                {/* ── Employee Profile Card ─────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start md:items-center gap-5">
                            {/* Photo / Avatar */}
                            {employee.profile_photo_url ? (
                                <img
                                    src={employee.profile_photo_url}
                                    alt={employee.full_name}
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-primary-100 shadow-sm flex-shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-2xl border-2 border-primary-200 shadow-sm flex-shrink-0">
                                    {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {employee.full_name}
                                    </h1>
                                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold border border-gray-200">
                                        {employee.employee_number}
                                    </span>
                                </div>

                                <p className="text-sm font-medium text-gray-700 mt-1">
                                    {employee.job_title}
                                    {employee.department && (
                                        <span className="text-gray-400 font-normal"> &bull; {employee.department}</span>
                                    )}
                                </p>

                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                                        {employee.category?.name}
                                    </span>
                                    <StatusBadge status={employee.employment_status} type="employment" />
                                    {employee.user ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                                            <UserCheck className="w-3.5 h-3.5" />
                                            <span>@{employee.user.username}</span>
                                            <span className={`w-1.5 h-1.5 rounded-full ${employee.user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        </div>
                                    ) : (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 italic">
                                            No Login Account
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => setStatusModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-colors"
                            >
                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                <span>Change Status</span>
                            </button>
                            <Link
                                href={`/employees/${employee.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-xs font-semibold text-white shadow-xs transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit Profile</span>
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-t border-gray-100 mt-8 pt-4">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                activeTab === 'profile'
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                activeTab === 'account'
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Login Account</span>
                            {employee.user && (
                                <span className={`w-1.5 h-1.5 rounded-full ${employee.user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                activeTab === 'documents'
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Documents</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 text-[10px]">
                                {employee.documents?.length || 0}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ── TAB 1: Profile & Employment Details ────────────────── */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-100">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <User className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
                            </div>
                            <dl className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Full Name</dt>
                                    <dd className="font-semibold text-gray-900">{employee.full_name}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Gender</dt>
                                    <dd className="font-medium text-gray-800">{employee.gender || 'Not specified'}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Date of Birth</dt>
                                    <dd className="font-medium text-gray-800">{employee.date_of_birth || 'Not specified'}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">State of Origin</dt>
                                    <dd className="font-medium text-gray-800">{employee.state_of_origin || 'Not specified'}</dd>
                                </div>
                                <div className="flex justify-between py-1">
                                    <dt className="text-gray-500">LGA</dt>
                                    <dd className="font-medium text-gray-800">{employee.lga || 'Not specified'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Phone className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-sm font-bold text-gray-900">Contact Details</h3>
                            </div>
                            <dl className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Primary Phone</dt>
                                    <dd className="font-semibold text-gray-900 font-mono">{employee.phone_number}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Alternative Phone</dt>
                                    <dd className="font-medium text-gray-800 font-mono">{employee.alt_phone_number || 'None'}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Email Address</dt>
                                    <dd className="font-medium text-gray-800">{employee.email || 'None'}</dd>
                                </div>
                                <div className="py-1">
                                    <dt className="text-gray-500 mb-1">Residential Address</dt>
                                    <dd className="font-medium text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                        {employee.residential_address}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Employment Details */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Briefcase className="w-4 h-4 text-purple-600" />
                                <h3 className="text-sm font-bold text-gray-900">Employment Details</h3>
                            </div>
                            <dl className="space-y-3 text-xs">
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Category</dt>
                                    <dd className="font-semibold text-gray-900">{employee.category?.name}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Job Title</dt>
                                    <dd className="font-semibold text-gray-900">{employee.job_title}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Department</dt>
                                    <dd className="font-medium text-gray-800">{employee.department || 'General'}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Employment Type</dt>
                                    <dd className="font-medium text-gray-800">{employee.employment_type}</dd>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <dt className="text-gray-500">Date Employed</dt>
                                    <dd className="font-mono text-gray-800 font-semibold">{employee.date_employed}</dd>
                                </div>
                                <div className="flex justify-between py-1">
                                    <dt className="text-gray-500">Employment Status</dt>
                                    <dd><StatusBadge status={employee.employment_status} type="employment" /></dd>
                                </div>
                            </dl>
                        </div>

                        {/* Qualifications & Notes */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <GraduationCap className="w-4 h-4 text-amber-600" />
                                <h3 className="text-sm font-bold text-gray-900">Qualifications &amp; Notes</h3>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div>
                                    <p className="text-gray-500 mb-1 font-semibold">Academic &amp; Professional Qualifications</p>
                                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-800 min-h-[60px] whitespace-pre-wrap">
                                        {employee.qualifications || 'No qualifications recorded.'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1 font-semibold">Administrative Notes</p>
                                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-800 min-h-[60px] whitespace-pre-wrap">
                                        {employee.additional_notes || 'No additional notes.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: Login Account Management ───────────────────── */}
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-in fade-in duration-100">
                        {employee.user ? (
                            /* Linked User Details & Management */
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">Linked User Account</h3>
                                            <p className="text-xs text-gray-500">
                                                This employee is connected to an active authentication record.
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={employee.user.is_active} type="account" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Account ID:</span>
                                            <span className="font-mono text-gray-900 font-bold">#{employee.user.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Username:</span>
                                            <span className="font-mono text-primary-700 font-bold">@{employee.user.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Account Email:</span>
                                            <span className="text-gray-800">{employee.user.email || 'None'}</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                                        <div>
                                            <span className="text-gray-500 block mb-1">Assigned Application Roles:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {employee.user.roles && employee.user.roles.length > 0 ? (
                                                    employee.user.roles.map((r) => (
                                                        <RoleBadge key={r.id || r.name} role={r.name} />
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic">No roles assigned</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <span className="text-gray-500">Account Status:</span>
                                            <span className="ml-2 font-semibold text-gray-900">
                                                {employee.user.is_active ? 'Active (Can Log In)' : 'Deactivated (Login Denied)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Actions */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={triggerToggleAccountActive}
                                            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                                                employee.user.is_active
                                                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            }`}
                                        >
                                            {employee.user.is_active ? 'Deactivate Account' : 'Activate Account'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setResetPasswordModalOpen(true)}
                                            className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                                            <span>Reset Password</span>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={triggerUnlinkAccount}
                                        className="px-4 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <Unlink className="w-3.5 h-3.5" />
                                        <span>Unlink Account</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* No Account: Offer Create or Link */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Option 1: Create Account */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                                            <UserCheck className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Create New Login Account</h3>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Create a brand-new user account with a secure username and password, and link it directly to {employee.full_name}.
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setCreateAccountModalOpen(true)}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Create Login Account</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Option 2: Link Existing Unlinked User */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                                            <UserCog className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Link Existing User Account</h3>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Connect an already existing standalone user account that does not yet have an associated employee record.
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            disabled={unlinkedUsers.length === 0}
                                            onClick={() => setLinkAccountModalOpen(true)}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                                        >
                                            <Unlink className="w-4 h-4 text-gray-500 rotate-45" />
                                            <span>
                                                {unlinkedUsers.length > 0 ? `Link Existing Account (${unlinkedUsers.length} available)` : 'No Unlinked Accounts'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: Document Management ────────────────────────── */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6 animate-in fade-in duration-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Employee Documents</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Securely stored certificates, professional qualifications, ID documents, and letters.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUploadDocModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Upload Document</span>
                            </button>
                        </div>

                        {/* Documents Table */}
                        {employee.documents && employee.documents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs divide-y divide-gray-200">
                                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="py-2.5 px-3">Title &amp; File</th>
                                            <th className="py-2.5 px-3">Category</th>
                                            <th className="py-2.5 px-3">Size</th>
                                            <th className="py-2.5 px-3">Uploaded Date</th>
                                            <th className="py-2.5 px-3">Uploaded By</th>
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {employee.documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-bold text-gray-900">{doc.title}</p>
                                                            <p className="text-[11px] text-gray-400 font-mono truncate max-w-xs">{doc.file_name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                                                        {doc.document_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                                                    {doc.formatted_size || `${Math.round(doc.file_size / 1024)} KB`}
                                                </td>
                                                <td className="py-3 px-3 text-gray-600 font-mono text-[11px]">
                                                    {doc.created_at ? doc.created_at.substring(0, 10) : '—'}
                                                </td>
                                                <td className="py-3 px-3 text-gray-600 text-[11px]">
                                                    {doc.uploader?.name || 'System'}
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <a
                                                            href={`/employees/${employee.id}/documents/${doc.id}/view`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                                                            title="Preview inline"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a
                                                            href={`/employees/${employee.id}/documents/${doc.id}/download`}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 transition-colors"
                                                            title="Download secure copy"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerDeleteDocument(doc)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-colors"
                                                            title="Delete Document"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500 font-medium">No documents uploaded for this employee yet.</p>
                                <button
                                    type="button"
                                    onClick={() => setUploadDocModalOpen(true)}
                                    className="mt-3 text-xs font-semibold text-primary-600 hover:underline"
                                >
                                    Upload first document &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODALS                                                          */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* Modal: Change Status */}
            {statusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setStatusModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Change Employment Status</h3>
                            <button onClick={() => setStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">New Employment Status</label>
                                <select
                                    value={statusForm.data.employment_status}
                                    onChange={(e) => statusForm.setData('employment_status', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {employmentStatuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Status Change Reason / Note</label>
                                <textarea
                                    rows={3}
                                    value={statusForm.data.status_note}
                                    onChange={(e) => statusForm.setData('status_note', e.target.value)}
                                    placeholder="Optional explanation e.g. Maternity leave approval, sabbatical, etc."
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStatusModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {statusForm.processing ? 'Saving...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Create User Account */}
            {createAccountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setCreateAccountModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Create Login Account for {employee.full_name}</h3>
                            <button onClick={() => setCreateAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAccountSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.data.username}
                                    onChange={(e) => accountForm.setData('username', e.target.value)}
                                    placeholder="e.g. sbalogun"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {accountForm.errors.username && <p className="text-red-600 text-[11px] mt-1">{accountForm.errors.username}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="email"
                                    value={accountForm.data.email}
                                    onChange={(e) => accountForm.setData('email', e.target.value)}
                                    placeholder="Optional email address"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {accountForm.errors.email && <p className="text-red-600 text-[11px] mt-1">{accountForm.errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={accountForm.data.password}
                                        onChange={(e) => accountForm.setData('password', e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {accountForm.errors.password && <p className="text-red-600 text-[11px] mt-1">{accountForm.errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={accountForm.data.password_confirmation}
                                        onChange={(e) => accountForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat password"
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Assigned Role <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={accountForm.data.role}
                                    onChange={(e) => accountForm.setData('role', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {availableRoles.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={accountForm.data.is_active}
                                        onChange={(e) => accountForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>Account is active immediately</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setCreateAccountModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={accountForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {accountForm.processing ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Link Existing User */}
            {linkAccountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setLinkAccountModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Link Existing User Account</h3>
                            <button onClick={() => setLinkAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleLinkSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Select User Account</label>
                                <select
                                    required
                                    value={linkForm.data.user_id}
                                    onChange={(e) => linkForm.setData('user_id', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {unlinkedUsers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} (@{u.username})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setLinkAccountModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={linkForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {linkForm.processing ? 'Linking...' : 'Link Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Reset Password */}
            {resetPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setResetPasswordModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Reset Account Password</h3>
                            <button onClick={() => setResetPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">New Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    required
                                    value={resetPasswordForm.data.password}
                                    onChange={(e) => resetPasswordForm.setData('password', e.target.value)}
                                    placeholder="Min 8 characters"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {resetPasswordForm.errors.password && (
                                    <p className="text-red-600 text-[11px] mt-1">{resetPasswordForm.errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    required
                                    value={resetPasswordForm.data.password_confirmation}
                                    onChange={(e) => resetPasswordForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Repeat new password"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResetPasswordModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetPasswordForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {resetPasswordForm.processing ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Upload Document */}
            {uploadDocModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setUploadDocModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Upload Employee Document</h3>
                            <button onClick={() => setUploadDocModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleDocSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Document Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={docForm.data.title}
                                    onChange={(e) => docForm.setData('title', e.target.value)}
                                    placeholder="e.g. B.Sc Degree Certificate"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {docForm.errors.title && <p className="text-red-600 text-[11px] mt-1">{docForm.errors.title}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Document Type <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={docForm.data.document_type}
                                    onChange={(e) => docForm.setData('document_type', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {documentTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">File Attachment <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => docForm.setData('document_file', e.target.files[0])}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">PDF, DOC, DOCX, JPG or PNG up to 10MB.</p>
                                {docForm.errors.document_file && <p className="text-red-600 text-[11px] mt-1">{docForm.errors.document_file}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setUploadDocModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={docForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {docForm.processing ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDanger={confirmModal.isDanger}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
            />
        </AuthenticatedLayout>
    );
}
