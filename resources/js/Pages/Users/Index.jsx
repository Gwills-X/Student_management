import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmationModal from '@/Components/ConfirmationModal';
import Pagination from '@/Components/Pagination';
import RoleBadge from '@/Components/RoleBadge';
import StatusBadge from '@/Components/StatusBadge';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    Filter,
    KeyRound,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Shield,
    ShieldAlert,
    User,
    UserCheck,
    UserCog,
    Users,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({
    users,
    filters = {},
    availableRoles = [],
    stats = {},
}) {
    const { auth } = usePage().props;
    const currentUser = auth?.user || {};

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [isActive, setIsActive] = useState(filters.is_active || '');
    const [linkedStatus, setLinkedStatus] = useState(filters.linked_status || '');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        isDanger: false,
        onConfirm: () => {},
    });

    // ── Form: Create User ──────────────────────────────────────────────────
    const createForm = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: availableRoles.length > 0 ? availableRoles[0] : '',
        is_active: true,
    });

    function handleCreateSubmit(e) {
        e.preventDefault();
        createForm.post('/users', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    }

    // ── Form: Edit User ────────────────────────────────────────────────────
    const editForm = useForm({
        name: '',
        email: '',
        role: '',
        is_active: true,
    });

    function openEditModal(u) {
        setSelectedUser(u);
        const currentRole = u.roles && u.roles.length > 0 ? u.roles[0].name : (availableRoles[0] || '');
        editForm.setData({
            name: u.name,
            email: u.email || '',
            role: currentRole,
            is_active: Boolean(u.is_active),
        });
        setEditModalOpen(true);
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        editForm.put(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedUser(null);
            },
        });
    }

    // ── Form: Reset Password ───────────────────────────────────────────────
    const resetPasswordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    function openResetPasswordModal(u) {
        setSelectedUser(u);
        resetPasswordForm.reset();
        setResetPasswordModalOpen(true);
    }

    function handleResetPasswordSubmit(e) {
        e.preventDefault();
        resetPasswordForm.post(`/users/${selectedUser.id}/reset-password`, {
            onSuccess: () => {
                setResetPasswordModalOpen(false);
                setSelectedUser(null);
                resetPasswordForm.reset();
            },
        });
    }

    // ── Action: Toggle Active Status ───────────────────────────────────────
    function triggerToggleStatus(u) {
        const action = u.is_active ? 'deactivate' : 'activate';
        setConfirmModal({
            isOpen: true,
            title: `${action === 'deactivate' ? 'Deactivate' : 'Activate'} User Account`,
            message: `Are you sure you want to ${action} account @${u.username}? ${
                action === 'deactivate' ? 'This user will be immediately prevented from logging into the system.' : 'This user will be permitted to log in.'
            }`,
            confirmText: action === 'deactivate' ? 'Deactivate' : 'Activate',
            isDanger: action === 'deactivate',
            onConfirm: () => {
                router.patch(`/users/${u.id}/toggle-status`, {}, {
                    onFinish: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
                });
            },
        });
    }

    function handleFilter(e) {
        e?.preventDefault();
        router.get(
            '/users',
            {
                search: search || undefined,
                role: role || undefined,
                is_active: isActive || undefined,
                linked_status: linkedStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    }

    function handleReset() {
        setSearch('');
        setRole('');
        setIsActive('');
        setLinkedStatus('');
        router.get('/users', {}, { replace: true });
    }

    return (
        <AuthenticatedLayout title="User Administration">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            User Accounts Administration
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Manage authentication accounts, role permissions, and access status.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            createForm.reset();
                            setCreateModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create User Account</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{stats.total ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                        <p className="text-xl font-bold text-emerald-700 mt-1">{stats.active ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Inactive</span>
                        <p className="text-xl font-bold text-red-700 mt-1">{stats.inactive ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Linked to Staff</span>
                        <p className="text-xl font-bold text-blue-700 mt-1">{stats.linked ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Standalone</span>
                        <p className="text-xl font-bold text-purple-700 mt-1">{stats.standalone ?? 0}</p>
                    </div>
                </div>

                {/* Filter and Search */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                    <form onSubmit={handleFilter} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search username, name, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Role Filter */}
                            <div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Roles</option>
                                    {availableRoles.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active Status */}
                            <div>
                                <select
                                    value={isActive}
                                    onChange={(e) => setIsActive(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive Only</option>
                                </select>
                            </div>

                            {/* Linked Status */}
                            <div>
                                <select
                                    value={linkedStatus}
                                    onChange={(e) => setLinkedStatus(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Account Types</option>
                                    <option value="linked">Linked to Employee</option>
                                    <option value="standalone">Standalone Account</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
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
                    {users.data.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">No user accounts found</h3>
                            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search keywords.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">User Account</th>
                                        <th className="py-3 px-4">Email Address</th>
                                        <th className="py-3 px-4">Assigned Role(s)</th>
                                        <th className="py-3 px-4">Linked Employee</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {users.data.map((u) => {
                                        const isSuperAdmin = u.roles?.some((r) => r.name === 'Super Administrator');
                                        const isCurrentSelf = currentUser.id === u.id;

                                        return (
                                            <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                                                {/* User Info */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-gray-900">{u.name}</span>
                                                                {isCurrentSelf && (
                                                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">You</span>
                                                                )}
                                                            </div>
                                                            <p className="font-mono text-[11px] text-gray-500 font-medium">@{u.username}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="py-3 px-4 text-gray-600">
                                                    {u.email || <span className="text-gray-400 italic">None</span>}
                                                </td>

                                                {/* Roles */}
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.roles && u.roles.length > 0 ? (
                                                            u.roles.map((r) => (
                                                                <RoleBadge key={r.id || r.name} role={r.name} />
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 italic">No roles</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Linked Employee */}
                                                <td className="py-3 px-4">
                                                    {u.employee ? (
                                                        <div>
                                                            <Link
                                                                href={`/employees/${u.employee.id}`}
                                                                className="font-semibold text-primary-700 hover:underline"
                                                            >
                                                                {u.employee.first_name} {u.employee.last_name}
                                                            </Link>
                                                            <p className="font-mono text-[11px] text-gray-400">{u.employee.employee_number}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-500 font-medium">
                                                            Standalone
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-4">
                                                    <StatusBadge status={u.is_active} type="account" />
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        {/* Edit User */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(u)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                                                            title="Edit User Details / Role"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Reset Password */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openResetPasswordModal(u)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                                                            title="Reset Password"
                                                        >
                                                            <KeyRound className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Toggle Active (Protected for Super Admin & Self) */}
                                                        {!isSuperAdmin && !isCurrentSelf && (
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerToggleStatus(u)}
                                                                className={`p-1.5 rounded-lg transition-colors ${
                                                                    u.is_active
                                                                        ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                                                        : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                                title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                                                            >
                                                                {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Pagination links={users.links} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODALS                                                          */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/* Create User Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setCreateModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Create Standalone User Account</h3>
                            <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {createForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.username}
                                    onChange={(e) => createForm.setData('username', e.target.value)}
                                    placeholder="e.g. jdoe"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {createForm.errors.username && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.username}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {createForm.errors.email && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        placeholder="Min 8 chars"
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                    {createForm.errors.password && <p className="text-red-600 text-[11px] mt-1">{createForm.errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        required
                                        value={createForm.data.password_confirmation}
                                        onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat"
                                        className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Application Role <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value)}
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
                                        checked={createForm.data.is_active}
                                        onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span>Account is Active immediately</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setEditModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Edit User @{selectedUser.username}</h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {editForm.errors.name && <p className="text-red-600 text-[11px] mt-1">{editForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                />
                                {editForm.errors.email && <p className="text-red-600 text-[11px] mt-1">{editForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">Assigned Role <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={editForm.data.role}
                                    onChange={(e) => editForm.setData('role', e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500"
                                >
                                    {availableRoles.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {!selectedUser.roles?.some((r) => r.name === 'Super Administrator') && (
                                <div className="flex items-center pt-1">
                                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_active}
                                            onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span>Account is Active</span>
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={() => setResetPasswordModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Reset Password for @{selectedUser.username}</h3>
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
                                <label className="block font-semibold text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
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
