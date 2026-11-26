import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, FileText, GraduationCap, Plus, UserX } from 'lucide-react';

export default function Dashboard({ stats, recentApplications = [] }) {
    const cards = [
        { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-primary-600 bg-primary-50' },
        { label: 'In Progress', value: stats.submitted, icon: Clock3, color: 'text-amber-600 bg-amber-50' },
        { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Rejected', value: stats.rejected, icon: UserX, color: 'text-red-600 bg-red-50' },
        { label: 'Converted', value: stats.converted, icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50' },
    ];

    return (
        <AuthenticatedLayout title="Admissions">
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admission Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Applications, assessments and student conversion</p>
                    </div>
                    <Link href="/admissions/applications/create" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
                        <Plus className="w-4 h-4" /> New Application
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {cards.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
                            <p className="text-2xl font-bold mt-3">{value ?? 0}</p>
                            <p className="text-xs font-semibold text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between">
                        <h2 className="font-bold">Recent Applications</h2>
                        <Link href="/admissions/applications" className="text-sm font-semibold text-primary-600">View all</Link>
                    </div>
                    {recentApplications.length === 0 ? (
                        <p className="p-8 text-center text-sm text-gray-500">No applications yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentApplications.map((application) => (
                                <Link key={application.id} href={`/admissions/applications/${application.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                                    <div><p className="font-semibold text-gray-900">{application.application_number}</p><p className="text-xs text-gray-500">{application.first_name} {application.last_name}</p></div>
                                    <span className="text-xs font-semibold text-gray-600">{application.status}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
