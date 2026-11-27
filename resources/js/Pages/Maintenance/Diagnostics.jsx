import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, {
    ReauthBanner,
    StatusPill,
} from "@/Components/MaintenanceNav";
import { Head } from "@inertiajs/react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

function Check({ label, ok, detail, warn }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
            {ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : warn ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            ) : (
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                {detail && (
                    <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                )}
            </div>
        </div>
    );
}

export default function MaintenanceDiagnostics(d) {
    const writableOk = Object.values(d.writable_dirs || {}).every(Boolean);

    return (
        <MaintenanceLayout
            title="System Diagnostics"
            heading="System Diagnostics"
            description="Read-only checks. Nothing on this page modifies data or files."
        >
            <Head title="Diagnostics — Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={d.reauth_valid} lifetime={900} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Application
                    </h2>
                    <Check
                        label="Application environment"
                        ok={d.environment === "production"}
                        warn={d.environment !== "production"}
                        detail={`Running in: ${d.environment}`}
                    />
                    <Check
                        label="Debug mode disabled"
                        ok={!d.debug_enabled}
                        detail={
                            d.debug_enabled
                                ? "Debug mode is ON — disable in production."
                                : "app.debug is off."
                        }
                    />
                    <Check
                        label="Application key configured"
                        ok={d.app_key_set}
                        detail="Key value is never displayed."
                    />
                    <Check
                        label=".env file present"
                        ok={d.env_present}
                        detail="Existence only — contents are never read."
                    />
                    <Check
                        label="Laravel version"
                        ok
                        detail={d.laravel_version}
                    />
                    <Check label="PHP version" ok detail={d.php_version} />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Deployment
                    </h2>
                    <Check
                        label="Frontend build manifest"
                        ok={d.build_manifest}
                        warn={!d.build_manifest}
                        detail={
                            d.build_manifest
                                ? "public/build/manifest.json found."
                                : 'public/build/manifest.json missing — run "npm run build" locally and deploy, or the frontend will fail to load.'
                        }
                    />
                    <Check
                        label="Storage link present"
                        ok={d.storage_link?.exists}
                        warn={!d.storage_link?.exists}
                        detail={
                            d.storage_link?.exists
                                ? "public/storage resolves."
                                : "public/storage missing — see the Storage page."
                        }
                    />
                    <Check
                        label="Database connection"
                        ok={d.db_connected}
                        detail={
                            d.db_connected
                                ? "A test query succeeded."
                                : "Could not connect — check credentials with your host."
                        }
                    />
                    <Check
                        label="Migrations table exists"
                        ok={d.migrations_table}
                        warn={!d.migrations_table}
                        detail={
                            d.migrations_table
                                ? "Migration tracking is active."
                                : "The migrations table does not exist yet — run migrations first."
                        }
                    />
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Directory Writability
                        </h2>
                        <StatusPill ok={writableOk}>
                            {writableOk ? "All writable" : "Issues found"}
                        </StatusPill>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        {Object.entries(d.writable_dirs || {}).map(
                            ([dir, ok]) => (
                                <Check
                                    key={dir}
                                    label={dir}
                                    ok={ok}
                                    detail={
                                        ok
                                            ? "Writable."
                                            : "Not writable — contact your host to fix permissions (do not chmod 777)."
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </MaintenanceLayout>
    );
}
