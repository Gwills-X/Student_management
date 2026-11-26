import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function Index({ applications, filters = {}, statuses = [], sessions = [], classLevels = [] }) {
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(next) {
        router.get('/admissions/applications', { ...filters, ...next }, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout title="Admission Applications">
            <div className="space-y-5 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Applications</h1>
                    <Link href="/admissions/applications/create" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> New Application</Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 grid md:grid-cols-4 gap-3">
                    <div className="relative md:col-span-1">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })} placeholder="Search applicant..." className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
                    </div>
                    <select value={filters.status || ''} onChange={(e) => applyFilters({ status: e.target.value })} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                    <select value={filters.academic_session_id || ''} onChange={(e) => applyFilters({ academic_session_id: e.target.value })} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="">All sessions</option>{sessions.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}</select>
                    <select value={filters.class_level_id || ''} onChange={(e) => applyFilters({ class_level_id: e.target.value })} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="">All class levels</option>{classLevels.map((level) => <option key={level.id} value={level.id}>{level.stage?.name} - {level.name}</option>)}</select>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {applications.data.length === 0 ? (
                        <p className="p-10 text-center text-sm text-gray-500">No applications match your filters.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 text-left">Application</th><th className="px-5 py-3 text-left">Applicant</th><th className="px-5 py-3 text-left">Session</th><th className="px-5 py-3 text-left">Status</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.data.map((application) => (
                                        <tr key={application.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4"><Link href={`/admissions/applications/${application.id}`} className="font-semibold text-primary-700">{application.application_number}</Link></td>
                                            <td className="px-5 py-4">{application.first_name} {application.last_name}<p className="text-xs text-gray-500">@{application.applicant?.username}</p></td>
                                            <td className="px-5 py-4">{application.academic_session?.name}</td>
                                            <td className="px-5 py-4"><span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-semibold">{application.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
