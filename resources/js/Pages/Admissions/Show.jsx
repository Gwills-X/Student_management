import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ application, statuses = [] }) {
    const [statusRemarks, setStatusRemarks] = useState('');
    const [targetStatus, setTargetStatus] = useState(application.status);
    const assessment = useForm({ assessment_type: '', assessment_date: new Date().toISOString().slice(0, 10), score: '', maximum_score: '', outcome: '', remarks: '', status: 'Completed' });
    const document = useForm({ title: '', document_type: 'Birth Certificate', document_file: null });
    const field = 'w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm';

    function changeStatus(e) {
        e.preventDefault();
        router.patch(`/admissions/applications/${application.id}/status`, { status: targetStatus, remarks: statusRemarks });
    }

    function submitAssessment(e) {
        e.preventDefault();
        assessment.post(`/admissions/applications/${application.id}/assessments`);
    }

    function submitDocument(e) {
        e.preventDefault();
        document.post(`/admissions/applications/${application.id}/documents`);
    }

    function convert() {
        if (window.confirm('Convert this approved applicant into a permanent student?')) {
            router.post(`/admissions/applications/${application.id}/convert`);
        }
    }

    return (
        <AuthenticatedLayout title={`Application ${application.application_number}`}>
            <div className="max-w-7xl mx-auto space-y-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div><p className="text-xs text-gray-500">Application Number</p><h1 className="text-2xl font-bold">{application.application_number}</h1></div>
                    <span className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">{application.status}</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <section className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="font-bold mb-4">Applicant Information</h2>
                            <div className="grid md:grid-cols-2 gap-y-3 text-sm">
                                <p><span className="text-gray-500">Name:</span> <b>{application.first_name} {application.middle_name} {application.last_name}</b></p>
                                <p><span className="text-gray-500">Username:</span> <b>@{application.applicant?.username}</b></p>
                                <p><span className="text-gray-500">Session:</span> <b>{application.academic_session?.name}</b></p>
                                <p><span className="text-gray-500">Stage / Level:</span> <b>{application.education_stage?.name} / {application.class_level?.name}</b></p>
                                <p><span className="text-gray-500">Guardian:</span> <b>{application.guardian_name || '—'}</b></p>
                                <p><span className="text-gray-500">Guardian Phone:</span> <b>{application.guardian_phone || '—'}</b></p>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="font-bold mb-4">Documents</h2>
                            <form onSubmit={submitDocument} className="grid md:grid-cols-4 gap-3 mb-4">
                                <input value={document.data.title} onChange={(e) => document.setData('title', e.target.value)} placeholder="Document title" className={field} />
                                <input value={document.data.document_type} onChange={(e) => document.setData('document_type', e.target.value)} placeholder="Document type" className={field} />
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => document.setData('document_file', e.target.files[0])} className={field} />
                                <button className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold">Upload</button>
                            </form>
                            {application.documents?.length === 0 ? <p className="text-sm text-gray-500">No documents uploaded.</p> : (
                                <div className="space-y-2">{application.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 text-sm">
                                        <span>{doc.title} <small className="text-gray-400">({doc.document_type})</small></span>
                                        <span className="flex gap-3">
                                            <a href={`/admissions/applications/${application.id}/documents/${doc.id}/view`} target="_blank" rel="noreferrer" className="text-primary-600 font-semibold">View</a>
                                            <a href={`/admissions/applications/${application.id}/documents/${doc.id}/download`} className="text-primary-600 font-semibold">Download</a>
                                        </span>
                                    </div>
                                ))}</div>
                            )}
                        </section>

                        <section className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="font-bold mb-4">Assessments</h2>
                            <form onSubmit={submitAssessment} className="grid md:grid-cols-3 gap-3 mb-4">
                                <input value={assessment.data.assessment_type} onChange={(e) => assessment.setData('assessment_type', e.target.value)} placeholder="Assessment type" className={field} />
                                <input type="date" value={assessment.data.assessment_date} onChange={(e) => assessment.setData('assessment_date', e.target.value)} className={field} />
                                <select value={assessment.data.status} onChange={(e) => assessment.setData('status', e.target.value)} className={field}><option>Pending</option><option>Completed</option><option>Cancelled</option></select>
                                <input type="number" value={assessment.data.score} onChange={(e) => assessment.setData('score', e.target.value)} placeholder="Score" className={field} />
                                <input type="number" value={assessment.data.maximum_score} onChange={(e) => assessment.setData('maximum_score', e.target.value)} placeholder="Maximum score" className={field} />
                                <input value={assessment.data.outcome} onChange={(e) => assessment.setData('outcome', e.target.value)} placeholder="Outcome" className={field} />
                                <textarea value={assessment.data.remarks} onChange={(e) => assessment.setData('remarks', e.target.value)} placeholder="Remarks" className={`${field} md:col-span-2`} />
                                <button className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold">Record Assessment</button>
                            </form>
                            {application.assessments?.length === 0 ? <p className="text-sm text-gray-500">No assessments recorded.</p> : (
                                <div className="space-y-2">{application.assessments.map((item) => (
                                    <div key={item.id} className="border border-gray-100 rounded-xl px-3 py-2 text-sm flex justify-between">
                                        <div><b>{item.assessment_type}</b><p className="text-xs text-gray-500">{item.status} • {item.assessment_date}</p></div>
                                        <span>{item.score ?? '—'}{item.maximum_score ? ` / ${item.maximum_score}` : ''}</span>
                                    </div>
                                ))}</div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-5">
                        <section className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="font-bold mb-4">Review & Decision</h2>
                            <form onSubmit={changeStatus} className="space-y-3">
                                <select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)} className={field}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                                <textarea value={statusRemarks} onChange={(e) => setStatusRemarks(e.target.value)} placeholder="Decision / review remarks" className={`${field} h-24`} />
                                <button className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold">Change Status</button>
                            </form>
                            {application.status === 'Approved' && !application.converted_at && (
                                <button onClick={convert} className="mt-3 w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold">Convert to Student</button>
                            )}
                            {application.converted_at && <p className="mt-3 text-sm font-semibold text-emerald-700">Converted as permanent student</p>}
                        </section>

                        <section className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h2 className="font-bold mb-4">Admission History</h2>
                            {application.status_histories?.length === 0 ? <p className="text-sm text-gray-500">No history.</p> : (
                                <div className="space-y-3">{application.status_histories?.map((history) => (
                                    <div key={history.id} className="border-l-2 border-primary-300 pl-3 text-xs">
                                        <p className="font-semibold">{history.from_status || 'Start'} → {history.to_status}</p>
                                        {history.remarks && <p className="text-gray-500 mt-1">{history.remarks}</p>}
                                        <p className="text-gray-400 mt-1">{history.changed_at}</p>
                                    </div>
                                ))}</div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
