import MaintenanceLayout from "@/Components/MaintenanceLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { KeyRound, Lock } from "lucide-react";

export default function MaintenanceReauthenticate({ reauth_valid, lifetime }) {
    const form = useForm({ password: "" });

    function submit(e) {
        e.preventDefault();
        form.post(route("maintenance.reauth.attempt"), {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <MaintenanceLayout
            title="Re-authenticate"
            heading="Deployment Re-authentication"
            description={`Confirm the deployment maintenance password to unlock sensitive operations for ${Math.round(lifetime / 60)} minutes.`}
        >
            <Head title="Re-authenticate — Maintenance" />
            <div className="max-w-md mx-auto">
                {reauth_valid ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                        <Lock className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                        <p className="font-semibold text-emerald-800">
                            Already unlocked
                        </p>
                        <p className="text-sm text-emerald-700 mt-1">
                            Sensitive operations are currently available.
                        </p>
                        <a
                            href={route("maintenance.dashboard")}
                            className="mt-4 inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            Back to dashboard
                        </a>
                    </div>
                ) : (
                    <form
                        onSubmit={submit}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 mx-auto mb-4">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-600 text-center mb-5">
                            The password is verified server-side against a
                            secure hash and is never stored, logged or
                            displayed.
                        </p>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-900 mb-1.5"
                        >
                            Deployment maintenance password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="off"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData("password", e.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {form.errors.password && (
                            <p className="mt-1.5 text-xs text-red-600">
                                {form.errors.password}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            <Lock className="w-4 h-4" />
                            {form.processing
                                ? "Verifying…"
                                : "Unlock maintenance operations"}
                        </button>
                    </form>
                )}
            </div>
        </MaintenanceLayout>
    );
}
