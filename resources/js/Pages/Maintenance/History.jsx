import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav from "@/Components/MaintenanceNav";
import Pagination from "@/Components/Pagination";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Filter } from "lucide-react";

const ACTION_GROUPS = [
    { value: "", label: "All actions" },
    { value: "migrations", label: "Migrations" },
    { value: "seeders", label: "Seeders" },
    { value: "cache", label: "Cache" },
    { value: "storage", label: "Storage" },
    { value: "optimization", label: "Optimization" },
    { value: "reauth", label: "Re-authentication" },
];

export default function MaintenanceHistory({ logs, filters }) {
    const [action, setAction] = useState(filters?.action ?? "");
    const [result, setResult] = useState(filters?.result ?? "");

    function apply(nextAction = action, nextResult = result) {
        router.get(
            route("maintenance.history"),
            {
                action: nextAction || undefined,
                result: nextResult,
            },
            { preserveState: true },
        );
    }

    return (
        <MaintenanceLayout
            title="Operation History"
            heading="Maintenance Operation History"
            description="Audit trail of every maintenance action: who, what, when and whether it succeeded."
        >
            <Head title="History — Maintenance" />
            <MaintenanceNav />

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={action}
                        onChange={(e) => {
                            setAction(e.target.value);
                            apply(e.target.value, result);
                        }}
                        className="flex-1 rounded-lg border-gray-300 border text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        {ACTION_GROUPS.map((g) => (
                            <option key={g.value} value={g.value}>
                                {g.label}
                            </option>
                        ))}
                    </select>
                </div>
                <select
                    value={result}
                    onChange={(e) => {
                        setResult(e.target.value);
                        apply(action, e.target.value);
                    }}
                    className="rounded-lg border-gray-300 border text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">All results</option>
                    <option value="1">Successful</option>
                    <option value="0">Failed</option>
                </select>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {logs.data.length === 0 && (
                        <li className="px-5 py-8 text-center text-sm text-gray-500">
                            No operations match these filters.
                        </li>
                    )}
                    {logs.data.map((log) => (
                        <li key={log.id} className="px-5 py-4">
                            <div className="flex items-start gap-3">
                                {log.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium text-gray-900 text-sm">
                                            {log.action}
                                        </span>
                                        {log.target && (
                                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600">
                                                {log.target}
                                            </span>
                                        )}
                                        <span
                                            className={`text-[11px] font-bold uppercase ${log.success ? "text-emerald-600" : "text-red-600"}`}
                                        >
                                            {log.success
                                                ? "success"
                                                : "failure"}
                                        </span>
                                    </div>
                                    {log.output && (
                                        <p className="mt-1 text-xs text-gray-500 break-words">
                                            {log.output}
                                        </p>
                                    )}
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        {log.username || "unknown user"} ·{" "}
                                        {log.created_at}
                                        {log.ip_address
                                            ? ` · ${log.ip_address}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <Pagination links={logs.links} />
            </div>
        </MaintenanceLayout>
    );
}
