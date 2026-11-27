import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, { ReauthBanner } from "@/Components/MaintenanceNav";
import ConfirmationModal from "@/Components/ConfirmationModal";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { AlertTriangle, Box, Boxes, CheckCircle2, XCircle } from "lucide-react";

export default function MaintenanceSeeders({ seeders, groups, reauth_valid }) {
    const [target, setTarget] = useState(null); // {type:'seeder'|'group', slug, label}
    const [processing, setProcessing] = useState(false);

    function run() {
        if (!target) return;
        setProcessing(true);
        const payload =
            target.type === "group"
                ? { group: target.slug }
                : { slug: target.slug };
        router.post(route("maintenance.seeders.run"), payload, {
            onFinish: () => {
                setProcessing(false);
                setTarget(null);
            },
        });
    }

    return (
        <MaintenanceLayout
            title="Seeders"
            heading="Approved Seeders"
            description="Only seeder classes registered in the server-side allowlist (config/maintenance.php) can be executed."
        >
            <Head title="Seeders — Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={reauth_valid} lifetime={900} />

            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-sm text-amber-800 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                    Seeders can modify production data. Approved seeders are
                    written idempotently (updateOrCreate / firstOrCreate) and
                    are safe to re-run, but always back up first.
                </span>
            </div>

            {/* Individual seeders */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">
                        Individual approved seeders
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Classes are resolved server-side; the browser only
                        references a slug.
                    </p>
                </div>
                <ul className="divide-y divide-gray-100">
                    {seeders.map((s) => (
                        <li
                            key={s.slug}
                            className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                                    <Box className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                        {s.slug}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {s.description}
                                    </p>
                                    <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                                        {s.class}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                {s.class_valid ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                        valid
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                                        <XCircle className="w-3.5 h-3.5" />{" "}
                                        class missing
                                    </span>
                                )}
                                <button
                                    type="button"
                                    disabled={!s.class_valid}
                                    onClick={() =>
                                        setTarget({
                                            type: "seeder",
                                            slug: s.slug,
                                            label: s.slug,
                                        })
                                    }
                                    className="px-3.5 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Run
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Groups */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">
                        Approved seeder groups
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Runs each member seeder in order, one operation.
                    </p>
                </div>
                <ul className="divide-y divide-gray-100">
                    {groups.map((g) => (
                        <li
                            key={g.slug}
                            className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Boxes className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">
                                        {g.slug}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {g.description}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {(g.seeders || []).join(" → ")}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setTarget({
                                        type: "group",
                                        slug: g.slug,
                                        label: g.slug,
                                    })
                                }
                                className="px-3.5 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors flex-shrink-0"
                            >
                                Run Group
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <ConfirmationModal
                isOpen={!!target}
                isDanger
                processing={processing}
                title={`Run seeder: ${target?.label ?? ""}?`}
                confirmText="Yes, run it"
                onClose={() => !processing && setTarget(null)}
                onConfirm={run}
                message="This seeder will run against the PRODUCTION database and may create or update records. Ensure you have a backup. Continue?"
            />
        </MaintenanceLayout>
    );
}
