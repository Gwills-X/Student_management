import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, { ReauthBanner } from "@/Components/MaintenanceNav";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Gauge, RotateCcw, Zap } from "lucide-react";

export default function MaintenanceOptimization({ actions, reauth_valid }) {
    const [target, setTarget] = useState(null); // {key, label, command}
    const [processing, setProcessing] = useState(false);

    function run() {
        if (!target) return;
        setProcessing(true);
        router.post(
            route("maintenance.optimization.run"),
            { key: target.key },
            {
                onFinish: () => {
                    setProcessing(false);
                    setTarget(null);
                },
            },
        );
    }

    return (
        <MaintenanceLayout
            title="Optimization"
            heading="Application Optimization"
            description="Approved optimization commands only. Shared hosting may not support all of them — failures are reported honestly."
        >
            <Head title="Optimization — Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={reauth_valid} lifetime={900} />

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-sm text-amber-800 flex items-start gap-3">
                <Gauge className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                    If{" "}
                    <code className="bg-amber-100 px-1 rounded">
                        php artisan optimize
                    </code>{" "}
                    fails on shared hosting (common when config caching is
                    blocked), use the individual cache actions instead. A failed
                    command never produces a success message here.
                </span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary-600" />
                    <h2 className="font-semibold text-gray-900">
                        Available operations
                    </h2>
                </div>
                <ul className="divide-y divide-gray-100">
                    {Object.entries(actions || {}).map(([key, action]) => (
                        <li
                            key={key}
                            className="px-5 py-4 flex items-center gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">
                                    {action.label}
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono">
                                    {action.command}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setTarget({
                                        key,
                                        label: action.label,
                                        command: action.command,
                                    })
                                }
                                className="px-3.5 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors flex-shrink-0"
                            >
                                Run
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <ConfirmationModal
                isOpen={!!target}
                processing={processing}
                title={`Run: ${target?.label ?? ""}?`}
                confirmText="Confirm"
                onClose={() => !processing && setTarget(null)}
                onConfirm={run}
                message={`This will execute ${target?.command ?? "the command"} on the server. If the hosting environment does not support it, the operation will fail cleanly. Continue?`}
            />
        </MaintenanceLayout>
    );
}
