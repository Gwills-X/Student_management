import MaintenanceLayout from "@/Components/MaintenanceLayout";
import MaintenanceNav, {
    ReauthBanner,
    StatusPill,
} from "@/Components/MaintenanceNav";
import { Head, Link } from "@inertiajs/react";
import {
    AlertTriangle,
    Clock,
    Database,
    HardDrive,
    Lock,
    Server,
    ShieldCheck,
    Wrench,
} from "lucide-react";

function Card({ title, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                {title}
            </h2>
            {children}
        </div>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{label}</span>
            {children}
        </div>
    );
}

const quickLinks = [
    {
        href: "/admin/maintenance/migrations",
        label: "Migrations",
        icon: Database,
        desc: "Run pending migrations",
    },
    {
        href: "/admin/maintenance/seeders",
        label: "Seeders",
        icon: ShieldCheck,
        desc: "Approved seeders only",
    },
    {
        href: "/admin/maintenance/cache",
        label: "Cache",
        icon: Server,
        desc: "Clear / rebuild caches",
    },
    {
        href: "/admin/maintenance/storage",
        label: "Storage",
        icon: HardDrive,
        desc: "Link & diagnostics",
    },
];

export default function MaintenanceIndex(data) {
    const d = data;
    const writableOk = Object.values(d.writable_dirs || {}).every(Boolean);

    return (
        <MaintenanceLayout
            title="Maintenance"
            heading="Maintenance & Deployment"
            description="Restricted production operations panel. Every action is logged and requires re-authentication."
        >
            <Head title="Maintenance" />
            <MaintenanceNav />
            <ReauthBanner valid={d.reauth_valid} lifetime={900} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                {/* System snapshot */}
                <Card title="System">
                    <Row label="Laravel">
                        <span className="text-sm font-semibold text-gray-900">
                            {d.laravel_version}
                        </span>
                    </Row>
                    <Row label="PHP">
                        <span className="text-sm font-semibold text-gray-900">
                            {d.php_version}
                        </span>
                    </Row>
                    <Row label="Environment">
                        <StatusPill ok={d.environment === "production"}>
                            {d.environment}
                        </StatusPill>
                    </Row>
                    <Row label="Debug mode">
                        <StatusPill ok={!d.debug_enabled}>
                            {d.debug_enabled ? "ENABLED" : "disabled"}
                        </StatusPill>
                    </Row>
                    <Row label="App key configured">
                        <StatusPill ok={d.app_key_set}>
                            {d.app_key_set ? "yes" : "MISSING"}
                        </StatusPill>
                    </Row>
                </Card>

                {/* Database & deployment */}
                <Card title="Database & Deployment">
                    <Row label="Database connection">
                        <StatusPill ok={d.db_connected}>
                            {d.db_connected ? "connected" : "FAILED"}
                        </StatusPill>
                    </Row>
                    <Row label="Migrations table">
                        <StatusPill ok={d.migrations_table}>
                            {d.migrations_table ? "exists" : "missing"}
                        </StatusPill>
                    </Row>
                    <Row label="Build manifest">
                        <StatusPill ok={d.build_manifest}>
                            {d.build_manifest ? "found" : "NOT BUILT"}
                        </StatusPill>
                    </Row>
                    <Row label=".env present">
                        <StatusPill ok={d.env_present}>
                            {d.env_present ? "yes" : "missing"}
                        </StatusPill>
                    </Row>
                    <Row label="Storage link">
                        <StatusPill ok={d.storage_link?.exists}>
                            {d.storage_link?.exists ? "present" : "missing"}
                        </StatusPill>
                    </Row>
                </Card>

                {/* Writability */}
                <Card title="Writable Directories">
                    {Object.entries(d.writable_dirs || {}).map(([dir, ok]) => (
                        <Row key={dir} label={dir}>
                            <StatusPill ok={ok}>
                                {ok ? "writable" : "NOT WRITABLE"}
                            </StatusPill>
                        </Row>
                    ))}
                    <Row label="Overall">
                        <StatusPill ok={writableOk}>
                            {writableOk ? "all writable" : "issues found"}
                        </StatusPill>
                    </Row>
                </Card>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                    Migrations and seeders modify production data. Always back
                    up the database before running them. Diagnostic pages are
                    safe to view at any time.
                </span>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {quickLinks.map(({ href, label, icon: Icon, desc }) => (
                    <Link
                        key={href}
                        href={href}
                        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-primary-400 hover:shadow transition-all"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">
                                {label}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">{desc}</p>
                    </Link>
                ))}
            </div>

            {/* Recent activity */}
            <Card title="Recent Maintenance Activity">
                {(d.recent_logs || []).length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No maintenance operations recorded yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {d.recent_logs.map((log) => (
                            <li
                                key={log.id}
                                className="flex items-center gap-3 py-2.5"
                            >
                                {log.success ? (
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                                    {log.action}
                                    {log.target ? ` — ${log.target}` : ""}
                                </span>
                                <span className="text-xs text-gray-400 hidden sm:inline">
                                    {log.username}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {log.created_at}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-3">
                    <Link
                        href={route("maintenance.history")}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                        View full history →
                    </Link>
                </div>
            </Card>
        </MaintenanceLayout>
    );
}
