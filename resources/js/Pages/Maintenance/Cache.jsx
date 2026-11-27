import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, { ReauthBanner } from "@/Components/MaintenanceNav";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Eraser } from "lucide-react";

function ActionList({ actions, kind, onPick, disabled }) {
    return (
        <ul className="divide-y divide-gray-100">
            {Object.entries(actions).map(([key, action]) => (
                <li key={key} className="px-5 py-4 flex items-center gap-3">
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
                        disabled={disabled}
                        onClick={() => onPick(key, action.label)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-40 transition-colors flex-shrink-0"
                    >
                        {kind === "clear" ? (
                            <Eraser className="w-3.5 h-3.5" />
                        ) : (
                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                        )}
                        {kind === "clear" ? "Clear" : "Rebuild"}
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default function MaintenanceCache({
    clear_actions,
    rebuild_actions,
    reauth_valid,
}) {
    const [target, setTarget] = useState(null); // {kind, key, label}
    const [processing, setProcessing] = useState(false);

    function run() {
        if (!target) return;
        setProcessing(true);
        router.post(
            route(
                target.kind === "clear"
                    ? "maintenance.cache.clear"
                    : "maintenance.cache.rebuild",
            ),
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
            title="Cache"
            heading="Cache Management"
            description="Clear or rebuild Laravel caches. Each action runs individually and is confirmed before execution."
        >
            <Head title="Cache — Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={reauth_valid} lifetime={900} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <ArrowDownToLine className="w-4 h-4 text-amber-600" />
                        <h2 className="font-semibold text-gray-900">
                            Clear caches
                        </h2>
                    </div>
                    <ActionList
                        actions={clear_actions}
                        kind="clear"
                        onPick={(key, label) =>
                            setTarget({ kind: "clear", key, label })
                        }
                        disabled={false}
                    />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <ArrowUpFromLine className="w-4 h-4 text-primary-600" />
                        <h2 className="font-semibold text-gray-900">
                            Rebuild caches
                        </h2>
                    </div>
                    <p className="px-5 pt-3 pb-1 text-xs text-gray-500">
                        Note: route caching fails when routes use closures. If a
                        rebuild fails, clear it again and review the routes
                        involved.
                    </p>
                    <ActionList
                        actions={rebuild_actions}
                        kind="rebuild"
                        onPick={(key, label) =>
                            setTarget({ kind: "rebuild", key, label })
                        }
                        disabled={false}
                    />
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!target}
                processing={processing}
                title={`${target?.kind === "clear" ? "Clear" : "Rebuild"}: ${target?.label ?? ""}?`}
                confirmText="Confirm"
                onClose={() => !processing && setTarget(null)}
                onConfirm={run}
                message={
                    target?.kind === "clear"
                        ? "Clearing caches briefly removes cached configuration, routes or views. Application performance may dip momentarily until rebuilt. Continue?"
                        : "Rebuilding caches writes new cache files. Route caching will fail if any route uses a closure. Continue?"
                }
            />
        </MaintenanceLayout>
    );
}
