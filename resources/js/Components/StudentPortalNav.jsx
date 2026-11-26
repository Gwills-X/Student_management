import { GraduationCap } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

/**
 * Student self-service portal link. Rendered only when the authenticated user
 * holds the "Student" role — students see a link to their own profile page.
 */
export default function StudentPortalNav({ active }) {
    const { auth } = usePage().props;
    const roles = auth?.user?.roles || [];

    if (!roles.includes("Student")) return null;

    const isActive = active === "/my-student-profile";

    return (
        <div className="pt-4">
            <p className="px-3 pb-1 text-[11px] font-bold text-primary-400/80 uppercase tracking-wider">
                My School
            </p>
            <Link
                href="/my-student-profile"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                        ? "bg-primary-700 text-white shadow-sm"
                        : "text-primary-100 hover:bg-primary-800/80 hover:text-white"
                }`}
            >
                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                <span>My Profile</span>
            </Link>
        </div>
    );
}
