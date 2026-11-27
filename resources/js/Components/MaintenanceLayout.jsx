import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";

/**
 * Shared scaffold for all maintenance pages: wraps in the authenticated
 * layout with the maintenance header + sub-navigation, and surfaces the
 * global flash messages as dismissible banners.
 */
export default function MaintenanceLayout({
    title,
    heading,
    description,
    children,
}) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout title={title}>
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {heading}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 whitespace-pre-wrap break-words">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 whitespace-pre-wrap break-words">
                        {flash.error}
                    </div>
                )}
                {flash?.warning && (
                    <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 whitespace-pre-wrap break-words">
                        {flash.warning}
                    </div>
                )}

                {children}
            </div>
        </AuthenticatedLayout>
    );
}
