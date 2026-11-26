import { Head, usePage } from "@inertiajs/react";
import { ArrowLeft, GraduationCap, ShieldAlert } from "lucide-react";

/**
 * Branded "Access Denied" page rendered for 403 (AuthorizationException)
 * responses. Rendered as a standalone Inertia page so the unauthenticated /
 * partially-permissioned user never sees a raw stack-trace screen, and never
 * receives sensitive details about the resource they attempted to reach.
 */
export default function AccessDenied() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            <Head title="Access Denied" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 px-4 py-12">
                <div className="w-full max-w-lg text-center">
                    {/* Branding */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-600 shadow-md">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-white text-sm font-bold tracking-tight leading-tight">
                                Greenwood Academy
                            </p>
                            <p className="text-primary-400 text-xs font-medium">
                                School Management
                            </p>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mb-5">
                            <ShieldAlert className="w-8 h-8 text-red-500" />
                        </div>

                        <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
                            Error 403
                        </span>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            Access Denied
                        </h1>

                        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                            Sorry{" "}
                            <span className="font-semibold text-gray-800">
                                {user?.name ?? "there"}
                            </span>
                            , your account does not have the required permission
                            to view this page.
                        </p>
                        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                            If you believe you should have access, please
                            contact a system administrator to review your role
                            permissions.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a
                                href="/dashboard"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-xs transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to Dashboard</span>
                            </a>
                            <a
                                href="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors"
                            >
                                Sign in with a different account
                            </a>
                        </div>
                    </div>

                    <p className="mt-6 text-primary-300/60 text-xs">
                        &copy; {new Date().getFullYear()} Greenwood Academy —
                        School Management System
                    </p>
                </div>
            </div>
        </>
    );
}
