import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ applicantUsers = [], sessions = [], stages = [] }) {
    const [showApplicant, setShowApplicant] = useState(false);
    const applicantForm = useForm({ name: '', username: '', email: '', password: '' });
    const form = useForm({
        applicant_user_id: '', academic_session_id: '', education_stage_id: '',
        class_level_id: '', application_date: new Date().toISOString().slice(0, 10),
        status: 'Draft', first_name: '', middle_name: '', last_name: '',
        date_of_birth: '', gender: '', nationality: '', state_of_origin: '', lga: '',
        residential_address: '', phone_number: '', email: '', previous_school_name: '',
        previous_school_address: '', previous_class: '', previous_academic_record: '',
        guardian_name: '', guardian_relationship: '', guardian_phone: '',
        guardian_email: '', guardian_address: '', remarks: '',
    });

    const selectedStage = stages.find((stage) => String(stage.id) === String(form.data.education_stage_id));

    function submit(e) {
        e.preventDefault();
        form.post('/admissions/applications');
    }

    function createApplicant(e) {
        e.preventDefault();
        applicantForm.post('/admissions/applicants', { onSuccess: () => { applicantForm.reset(); setShowApplicant(false); } });
    }

    const field = 'w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm';

    return (
        <AuthenticatedLayout title="New Admission Application">
            <form onSubmit={submit} className="max-w-5xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">New Application</h1>
                    <button type="button" onClick={() => setShowApplicant(!showApplicant)} className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold bg-white">Create Applicant Account</button>
                </div>

                {showApplicant && (
                    <div className="bg-white border border-primary-200 rounded-2xl p-5">
                        <h2 className="font-bold mb-4">Applicant Account</h2>
                        <div className="grid md:grid-cols-4 gap-3">
                            <input placeholder="Full name" value={applicantForm.data.name} onChange={(e) => applicantForm.setData('name', e.target.value)} className={field} />
                            <input placeholder="Username" value={applicantForm.data.username} onChange={(e) => applicantForm.setData('username', e.target.value)} className={field} />
                            <input placeholder="Email (optional)" type="email" value={applicantForm.data.email} onChange={(e) => applicantForm.setData('email', e.target.value)} className={field} />
                            <input placeholder="Password" type="password" value={applicantForm.data.password} onChange={(e) => applicantForm.setData('password', e.target.value)} className={field} />
                        </div>
                        {Object.keys(applicantForm.errors).map((key) => <p key={key} className="text-xs text-red-600 mt-2">{applicantForm.errors[key]}</p>)}
                        <button type="button" onClick={createApplicant} className="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold">Save Account</button>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                    <h2 className="font-bold">Application Details</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <select value={form.data.applicant_user_id} onChange={(e) => form.setData('applicant_user_id', e.target.value)} className={field}><option value="">Select applicant</option>{applicantUsers.map((user) => <option key={user.id} value={user.id}>{user.name} (@{user.username})</option>)}</select>
                        <select value={form.data.academic_session_id} onChange={(e) => form.setData('academic_session_id', e.target.value)} className={field}><option value="">Academic session</option>{sessions.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}</select>
                        <input type="date" value={form.data.application_date} onChange={(e) => form.setData('application_date', e.target.value)} className={field} />
                        <select value={form.data.education_stage_id} onChange={(e) => { form.setData('education_stage_id', e.target.value); form.setData('class_level_id', ''); }} className={field}><option value="">Education stage</option>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select>
                        <select value={form.data.class_level_id} onChange={(e) => form.setData('class_level_id', e.target.value)} className={field}><option value="">Intended class level</option>{(selectedStage?.class_levels || []).map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}</select>
                        <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className={field}><option>Draft</option><option>Submitted</option></select>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                    <h2 className="font-bold">Applicant Biodata</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            ['first_name', 'First name'], ['middle_name', 'Middle name'], ['last_name', 'Last name'],
                            ['nationality', 'Nationality'], ['state_of_origin', 'State of origin'], ['lga', 'LGA'],
                            ['phone_number', 'Phone number'], ['email', 'Email'], ['gender', 'Gender'],
                        ].map(([key, label]) => <input key={key} placeholder={label} value={form.data[key]} onChange={(e) => form.setData(key, e.target.value)} className={field} />)}
                        <input type="date" value={form.data.date_of_birth} onChange={(e) => form.setData('date_of_birth', e.target.value)} className={field} />
                        <textarea placeholder="Residential address" value={form.data.residential_address} onChange={(e) => form.setData('residential_address', e.target.value)} className={`${field} md:col-span-2`} />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                        <h2 className="font-bold">Previous School</h2>
                        <input placeholder="School name" value={form.data.previous_school_name} onChange={(e) => form.setData('previous_school_name', e.target.value)} className={field} />
                        <input placeholder="Previous class" value={form.data.previous_class} onChange={(e) => form.setData('previous_class', e.target.value)} className={field} />
                        <textarea placeholder="Previous school address" value={form.data.previous_school_address} onChange={(e) => form.setData('previous_school_address', e.target.value)} className={field} />
                        <textarea placeholder="Academic record" value={form.data.previous_academic_record} onChange={(e) => form.setData('previous_academic_record', e.target.value)} className={field} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                        <h2 className="font-bold">Guardian / Emergency Contact</h2>
                        <input placeholder="Guardian name" value={form.data.guardian_name} onChange={(e) => form.setData('guardian_name', e.target.value)} className={field} />
                        <input placeholder="Relationship" value={form.data.guardian_relationship} onChange={(e) => form.setData('guardian_relationship', e.target.value)} className={field} />
                        <input placeholder="Phone" value={form.data.guardian_phone} onChange={(e) => form.setData('guardian_phone', e.target.value)} className={field} />
                        <input placeholder="Email" type="email" value={form.data.guardian_email} onChange={(e) => form.setData('guardian_email', e.target.value)} className={field} />
                        <textarea placeholder="Address" value={form.data.guardian_address} onChange={(e) => form.setData('guardian_address', e.target.value)} className={field} />
                    </div>
                </div>

                <textarea placeholder="Additional remarks" value={form.data.remarks} onChange={(e) => form.setData('remarks', e.target.value)} className={`${field} h-24`} />
                {Object.keys(form.errors).map((key) => <p key={key} className="text-sm text-red-600">{form.errors[key]}</p>)}
                <button type="submit" disabled={form.processing} className="px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold disabled:opacity-50">{form.processing ? 'Saving...' : 'Create Application'}</button>
            </form>
        </AuthenticatedLayout>
    );
}
