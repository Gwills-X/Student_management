import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, {
    ReauthBanner,
    StatusPill,
} from "@/Components/MaintenanceNav";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    HardDrive,
    Link2,
    XCircle,
} from "lucide-react";

export default function MaintenanceStorage({
    link_status,
    writable,
    reauth_valid,
}) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    function run() {
        setProcessing(true);
        router.post(
            route("maintenance.storage.link"),
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setConfirming(false);
                },
            },
        );
    }

    const writableOk = Object.values(writable || {}).every(Boolean);

    return (
        <MaintenanceLayout
            title="Storage"
            heading="Storage Diagnostics"
            description="Directory writability checks and the public storage link. No permissions are changed automatically."
        >
            <Head title="Storage — Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={reauth_valid} lifetime={900} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                {/* Storage link */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Link2 className="w-4 h-4 text-primary-600" />
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Public Storage Link
                        </h2>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                            public/storage exists
                        </span>
                        <StatusPill ok={link_status?.exists}>
                            {link_status?.exists ? "yes" : "no"}
                        </StatusPill>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className="text-xs font-semibold text-gray-900">
                            {link_status?.is_link
                                ? "symlink"
                                : link_status?.is_dir
                                  ? "real directory"
                                  : "missing"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                            Target resolves
                        </span>
                        <StatusPill ok={link_status?.target_accessible}>
                            {link_status?.target_accessible ? "yes" : "no"}
                        </StatusPill>
                    </div>

                    {link_status?.is_dir && (
                        <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>
                                public/storage is a real directory (typical on
                                InfinityFree where symlinks are blocked). The
                                panel will never overwrite it. See the
                                maintenance documentation for the supported
                                manual alternative.
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                    >
                        <HardDrive className="w-4 h-4" />
                        Create / verify storage link
                    </button>
                </div>

                {/* Writability */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Writable Directories
                        </h2>
                        <StatusPill ok={writableOk}>
                            {writableOk ? "All good" : "Issues found"}
                        </StatusPill>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {Object.entries(writable || {}).map(([dir, ok]) => (
                            <li
                                key={dir}
                                className="flex items-center gap-3 py-2.5"
                            >
                                {ok ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-sm text-gray-700 font-mono text-xs sm:text-sm flex-1">
                                    {dir}
                                </span>
                                <span
                                    className={`text-xs font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}
                                >
                                    {ok ? "writable" : "not writable"}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-xs text-gray-500">
                        Diagnostics only — the panel never changes permissions
                        on its own.
                    </p>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirming}
                processing={processing}
                title="Create / verify storage link?"
                confirmText="Confirm"
                onClose={() => !processing && setConfirming(false)}
                onConfirm={run}
                message="The panel will create public/storage only if it does not already exist, and will never overwrite a real directory or unrelated symlink. On hosts that block symlinks the operation will report honestly that it failed. Continue?"
            />
        </MaintenanceLayout>
    );
}
