import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, { ReauthBanner } from "@/Components/MaintenanceNav";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Info,
    PlayCircle,
    ShieldAlert,
} from "lucide-react";

/**
 * Generic GET-reachable confirmation page for a single maintenance operation.
 *
 * Reached by typing/pasting an operation URL into the address bar. It ONLY
 * renders the operation details — nothing executes until "Run Now" is
 * clicked, which issues a CSRF-protected POST to the same URL.
 */
export default function ConfirmOperation({
    operation,
    reauth_valid,
    status = null,
}) {
    const [processing, setProcessing] = useState(false);

    function runNow() {
        setProcessing(true);
        router.post(operation.endpoint, operation.payload ?? {}, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <MaintenanceLayout
            title={operation.label}
            heading="Confirm Operation"
            description="This page only shows what will happen. Nothing has been executed yet."
        >
            <Head title={`Confirm — ${operation.label}`} />
            <MaintenanceNav />
            <ReauthBanner valid={reauth_valid} lifetime={900} />

            <div className="max-w-2xl mx-auto">
                <div
                    className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${
                        operation.danger ? "border-red-200" : "border-gray-200"
                    }`}
                >
                    {/* Header */}
                    <div
                        className={`px-5 py-4 flex items-center gap-3 border-b ${
                            operation.danger
                                ? "bg-red-50 border-red-100"
                                : "bg-gray-50 border-gray-100"
                        }`}
                    >
                        {operation.danger ? (
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                                <Info className="w-5 h-5" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p
                                className={`text-[11px] font-bold uppercase tracking-wider ${
                                    operation.danger
                                        ? "text-red-600"
                                        : "text-primary-600"
                                }`}
                            >
                                {operation.danger
                                    ? "Dangerous operation"
                                    : "Maintenance operation"}
                            </p>
                            <h2 className="font-semibold text-gray-900 truncate">
                                {operation.label}
                            </h2>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Exact command */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Exact operation
                            </p>
                            <code className="block bg-gray-900 text-gray-100 rounded-xl px-4 py-3 text-xs font-mono break-all">
                                {operation.command}
                            </code>
                        </div>

                        {/* Impact */}
                        <div
                            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                                operation.danger
                                    ? "bg-red-50 text-red-800 border border-red-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                        >
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{operation.impact}</span>
                        </div>

                        {/* Optional context (migration status / link status) */}
                        {status?.available && (
                            <div className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span>
                                    {status.ran_count} migration(s) already ran
                                    · <strong>{status.pending_count}</strong>{" "}
                                    pending
                                </span>
                            </div>
                        )}
                        {status && status.available === undefined && (
                            <div className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
                                Current link status:{" "}
                                {status.is_link
                                    ? "symlink"
                                    : status.is_dir
                                      ? "real directory"
                                      : status.exists
                                        ? "present"
                                        : "missing"}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <a
                                href={operation.back}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go back
                            </a>
                            <button
                                type="button"
                                onClick={runNow}
                                disabled={processing}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 ${
                                    operation.danger
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-primary-600 hover:bg-primary-700"
                                }`}
                            >
                                <PlayCircle className="w-4 h-4" />
                                {processing ? "Running…" : "Run Now"}
                            </button>
                        </div>

                        <p className="text-[11px] text-gray-400 text-center">
                            "Run Now" submits a secure (CSRF-protected) request
                            and requires a valid deployment-password session.
                            Every execution is audited.
                        </p>
                    </div>
                </div>
            </div>
        </MaintenanceLayout>
    );
}
