import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RoleBadge from '@/Components/RoleBadge';
import StatusBadge from '@/Components/StatusBadge';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Briefcase,
    Calendar,
    GraduationCap,
    Layers,
    Plus,
    Shield,
    Sparkles,
    User,
    UserCheck,
    Users,
} from 'lucide-react';

export default function Dashboard({ user, metrics = {}, recentEmployees = [] }) {
    return (
        <AuthenticatedLayout title="Dashboard">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Welcome Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-3">
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Single-School Management System</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                Welcome, {user.name}
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Greenwood Academy Administration Portal — Academic Structure &amp; School Configuration Active.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/academic/classes/create"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-xs transition-colors"
                            >
                                <GraduationCap className="w-4 h-4 text-primary-600" />
                                <span>Add Class</span>
                            </Link>
                            <Link
                                href="/employees/create"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Register Employee</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Academic Session & Term Status Banner */}
                <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 rounded-2xl p-6 text-white shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-primary-200">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wider text-primary-200 font-semibold">
                                    Current Academic Timeline
                                </span>
                                <div className="flex items-center gap-3 mt-1">
                                    <h2 className="text-xl md:text-2xl font-bold">
                                        Session: {metrics.current_session}
                                    </h2>
                                    <span className="text-primary-300">•</span>
                                    <h3 className="text-lg md:text-xl font-medium text-primary-100">
                                        {metrics.current_term}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={route('academic.sessions.index')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors border border-white/20"
                            >
                                <span>Manage Sessions &amp; Terms &rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Academic Structure Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Class Groups
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {metrics.total_classes ?? 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Active session arms
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Curriculum Subjects
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <BookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                            {metrics.total_subjects ?? 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Across all education stages
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Education Stages
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">
                            {metrics.total_stages ?? 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {metrics.total_levels ?? 0} class levels
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total Staff
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                            {metrics.total_employees ?? 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {metrics.teaching_staff ?? 0} teaching educators
                        </p>
                    </div>
                </div>

                {/* Main Content Split: Profile Summary & Recent Employees */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-700">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Your Current Session</h3>
                                    <p className="text-xs text-gray-500">Security &amp; Permissions</p>
                                </div>
                            </div>

                            <dl className="space-y-3.5 text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <dt className="text-gray-500 text-xs">Full Name</dt>
                                    <dd className="font-semibold text-gray-900">{user.name}</dd>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <dt className="text-gray-500 text-xs">Username</dt>
                                    <dd className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                        @{user.username}
                                    </dd>
                                </div>
                                {user.email && (
                                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                        <dt className="text-gray-500 text-xs">Email</dt>
                                        <dd className="text-xs text-gray-700 truncate max-w-[180px]">{user.email}</dd>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <dt className="text-gray-500 text-xs mb-2">Role Permissions</dt>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((r) => <RoleBadge key={r} role={r} />)
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No role assigned</span>
                                        )}
                                    </div>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                <Shield className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                                <span>Super Admin Privileges Protected</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Employees Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900">
                                    Recent Employee Records
                                </h3>
                                <Link
                                    href="/employees"
                                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                                >
                                    View All Employees &rarr;
                                </Link>
                            </div>

                            {recentEmployees.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">
                                        No employee records created yet.
                                    </p>
                                    <Link
                                        href="/employees/create"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline"
                                    >
                                        Register the first employee &rarr;
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold">
                                                <th className="py-2.5 pr-3">Staff No</th>
                                                <th className="py-2.5 px-3">Name</th>
                                                <th className="py-2.5 px-3">Job Title</th>
                                                <th className="py-2.5 px-3">Category</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 pl-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentEmployees.map((emp) => (
                                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 pr-3 font-mono text-gray-900 font-medium">
                                                        {emp.employee_number}
                                                    </td>
                                                    <td className="py-3 px-3 font-medium text-gray-900">
                                                        {emp.first_name} {emp.last_name}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-600">
                                                        {emp.job_title}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-500">
                                                        {emp.category?.name}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <StatusBadge status={emp.employment_status} />
                                                    </td>
                                                    <td className="py-3 pl-3 text-right">
                                                        <Link
                                                            href={`/employees/${emp.id}`}
                                                            className="text-xs font-semibold text-primary-600 hover:text-primary-800"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Stage 3 Status Banner */}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>
                                Session-specific classes: <span className="font-mono text-primary-700 font-medium">JSS 1A</span> in one session is an isolated record from another session.
                            </span>
                            <Link
                                href={route('academic.classes.index')}
                                className="font-semibold text-primary-600 hover:underline"
                            >
                                Manage Classes &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
