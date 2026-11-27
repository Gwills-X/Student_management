import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, { ReauthBanner } from "@/Components/MaintenanceNav";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    PlayCircle,
    XCircle,
} from "lucide-react";

export default function MaintenanceMigrations({
    status,
    db_connected,
    reauth_valid,
}) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    function run() {
        setProcessing(true);
        router.post(
            route("maintenance.migrations.run"),
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setConfirming(false);
                },
            },
        );
    }

    if (!status.available) {
        return (
            <MaintenanceLayout
                title="Migrations"
                heading="Database Migrations"
                description="Migration tracking is not available because the migrations table does not exist."
            >
                <Head title="Migrations — Maintenance" />
                <MaintenanceNav />
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p>
                            The{" "}
                            <code className="bg-gray-100 px-1 rounded">
                                migrations
                            </code>{" "}
                            table could not be found
                            {db_connected === false
                                ? " (the database is not reachable)"
                                : ""}
                            . Once the panel's own migration has been deployed,
                            run pending migrations to initialise tracking.
                        </p>
                    </div>
                </div>
            </MaintenanceLayout>
        );
    }

    return (
        <MaintenanceLayout
            title="Migrations"
            heading="Database Migrations"
            description="Status is read-only. Running migrations is a confirmed, re-authenticated, POST-only operation."
        >
            <Head title="Migrations — Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={reauth_valid} lifetime={900} />

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-sm text-amber-800 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                    Migrations can change production data permanently. Back up
                    the database before running. Rollback / refresh / fresh
                    commands are permanently blocked from this panel.
                </span>
            </div>

            {/* Run action */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                        <h2 className="font-semibold text-gray-900">
                            Run pending migrations
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Executes{" "}
                            <code className="bg-gray-100 px-1 rounded">
                                migrate --force
                            </code>{" "}
                            on the server.
                            {status.pending_count === 0
                                ? " There are no pending migrations."
                                : ` ${status.pending_count} migration(s) pending.`}
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={status.pending_count === 0}
                        onClick={() => setConfirming(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <PlayCircle className="w-4 h-4" />
                        Run Migrations
                    </button>
                </div>
            </div>

            {/* Status table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                        Migration status
                    </h2>
                    <span className="text-xs text-gray-500">
                        {status.ran_count} ran · {status.pending_count} pending
                    </span>
                </div>
                <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {status.migrations.map((m) => (
                        <li
                            key={m.name}
                            className="flex items-center gap-3 px-5 py-2.5"
                        >
                            {m.ran ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                            <span className="text-sm text-gray-700 flex-1 truncate font-mono text-xs sm:text-sm">
                                {m.name}
                            </span>
                            <span
                                className={`text-xs font-semibold ${m.ran ? "text-emerald-600" : "text-amber-600"}`}
                            >
                                {m.ran ? `batch ${m.batch}` : "pending"}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <ConfirmationModal
                isOpen={confirming}
                isDanger
                processing={processing}
                title="Run database migrations?"
                confirmText="Yes, run migrations"
                onClose={() => !processing && setConfirming(false)}
                onConfirm={run}
                message={`This will run ${status.pending_count} pending migration(s) against the PRODUCTION database and may permanently change data. Ensure you have a backup. Continue?`}
            />
        </MaintenanceLayout>
    );
}
