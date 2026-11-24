import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import { Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Calendar,
    ChevronRight,
    Eye,
    Filter,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ employees, filters = {}, categories = [], stats = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [employmentStatus, setEmploymentStatus] = useState(filters.employment_status || '');
    const [employmentType, setEmploymentType] = useState(filters.employment_type || '');
    const [accountStatus, setAccountStatus] = useState(filters.account_status || '');

    function handleFilter(e) {
        e?.preventDefault();
        router.get(
            '/employees',
            {
                search: search || undefined,
                category_id: categoryId || undefined,
                employment_status: employmentStatus || undefined,
                employment_type: employmentType || undefined,
                account_status: accountStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    }

    function handleReset() {
        setSearch('');
        setCategoryId('');
        setEmploymentStatus('');
        setEmploymentType('');
        setAccountStatus('');
        router.get('/employees', {}, { replace: true });
    }

    return (
        <AuthenticatedLayout title="Employee Management">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header with Title and Registration CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Employee Directory
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Manage school academic, administrative and support staff records.
                        </p>
                    </div>
                    <Link
                        href="/employees/create"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Register Employee</span>
                    </Link>
                </div>

                {/* Stat Counters Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{stats.total ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                        <p className="text-xl font-bold text-emerald-700 mt-1">{stats.active ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">On Leave</span>
                        <p className="text-xl font-bold text-amber-700 mt-1">{stats.on_leave ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Teaching</span>
                        <p className="text-xl font-bold text-blue-700 mt-1">{stats.teaching ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Non-Teaching</span>
                        <p className="text-xl font-bold text-gray-700 mt-1">{stats.non_teaching ?? 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">With Account</span>
                        <p className="text-xl font-bold text-purple-700 mt-1">{stats.with_account ?? 0}</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                    <form onSubmit={handleFilter} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search staff no, name, phone, title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Employment Status */}
                            <div>
                                <select
                                    value={employmentStatus}
                                    onChange={(e) => setEmploymentStatus(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Employment Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Suspended">Suspended</option>
                                    <option value="Retired">Retired</option>
                                    <option value="Resigned">Resigned</option>
                                    <option value="Terminated">Terminated</option>
                                </select>
                            </div>

                            {/* Account Status Filter */}
                            <div>
                                <select
                                    value={accountStatus}
                                    onChange={(e) => setAccountStatus(e.target.value)}
                                    className="w-full py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">All Account Statuses</option>
                                    <option value="with_account">With User Account</option>
                                    <option value="without_account">No User Account</option>
                                    <option value="account_active">Account Active</option>
                                    <option value="account_inactive">Account Inactive</option>
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

                {/* Table Container */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {employees.data.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-900">No employees found</h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                No employee records matched your current query or filter criteria. Try adjusting or resetting filters.
                            </p>
                            <button
                                onClick={handleReset}
                                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Clear Filters</span>
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Employee</th>
                                        <th className="py-3 px-4">Category &amp; Dept</th>
                                        <th className="py-3 px-4">Job Title &amp; Type</th>
                                        <th className="py-3 px-4">Employment Status</th>
                                        <th className="py-3 px-4">Login Account</th>
                                        <th className="py-3 px-4">Employed Date</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {employees.data.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                                            {/* Employee info with Photo or Initials */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {emp.profile_photo_url ? (
                                                        <img
                                                            src={emp.profile_photo_url}
                                                            alt={emp.full_name}
                                                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs border border-primary-200 shadow-xs">
                                                            {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={`/employees/${emp.id}`}
                                                            className="font-bold text-gray-900 hover:text-primary-600 transition-colors"
                                                        >
                                                            {emp.full_name}
                                                        </Link>
                                                        <p className="font-mono text-[11px] text-gray-500 font-medium">
                                                            {emp.employee_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category & Department */}
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-800">
                                                    {emp.category?.name || 'Unassigned'}
                                                </p>
                                                {emp.department && (
                                                    <p className="text-[11px] text-gray-400">
                                                        {emp.department}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Job Title & Type */}
                                            <td className="py-3 px-4">
                                                <p className="font-semibold text-gray-900">
                                                    {emp.job_title}
                                                </p>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                                    {emp.employment_type}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3 px-4">
                                                <StatusBadge status={emp.employment_status} type="employment" />
                                            </td>

                                            {/* Account status */}
                                            <td className="py-3 px-4">
                                                {emp.user ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <UserCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                                        <div>
                                                            <span className="font-mono text-[11px] font-medium text-gray-800">
                                                                @{emp.user.username}
                                                            </span>
                                                            <div className="mt-0.5">
                                                                <StatusBadge status={emp.user.is_active} type="account" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 italic">
                                                        <UserX className="w-3 h-3" />
                                                        No Account
                                                    </span>
                                                )}
                                            </td>

                                            {/* Employed Date */}
                                            <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                                                {emp.date_employed}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <Link
                                                        href={`/employees/${emp.id}`}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/employees/${emp.id}/edit`}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                                                        title="Edit Details"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination links={employees.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
