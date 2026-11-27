import { Link } from "@inertiajs/react";
import {
    Activity,
    BarChart3,
    Boxes,
    Database,
    HardDrive,
    History,
    Lock,
    ServerCog,
} from "lucide-react";

const items = [
    {
        href: "/admin/maintenance",
        label: "Dashboard",
        icon: BarChart3,
        exact: true,
    },
    {
        href: "/admin/maintenance/diagnostics",
        label: "Diagnostics",
        icon: Activity,
    },
    {
        href: "/admin/maintenance/migrations",
        label: "Migrations",
        icon: Database,
    },
    { href: "/admin/maintenance/seeders", label: "Seeders", icon: Boxes },
    { href: "/admin/maintenance/cache", label: "Cache", icon: ServerCog },
    { href: "/admin/maintenance/storage", label: "Storage", icon: HardDrive },
    {
        href: "/admin/maintenance/optimization",
        label: "Optimization",
        icon: Activity,
    },
    { href: "/admin/maintenance/history", label: "History", icon: History },
];

export default function MaintenanceNav() {
    const current = window.location.pathname;
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-2 mb-6 shadow-sm overflow-x-auto">
            <nav className="flex items-center gap-1 min-w-max">
                {items.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact
                        ? current === href
                        : current.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                                active
                                    ? "bg-primary-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export function ReauthBanner({ valid, lifetime }) {
    if (valid) {
        return (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 mb-6 text-sm">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>
                    Sensitive operations are unlocked (
                    {Math.round(lifetime / 60)} minute window).
                </span>
            </div>
        );
    }
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6 text-sm">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">
                Re-authentication required before running any operation that
                modifies data or files.
            </span>
            <Link
                href={route("maintenance.reauth")}
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
                Enter Deployment Password
            </Link>
        </div>
    );
}

export function StatusPill({ ok, children }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                ok
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}
            />
            {children}
        </span>
    );
}
