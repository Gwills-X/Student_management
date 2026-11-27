import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    ClipboardCheck,
    GraduationCap,
    UserCog,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    School,
    Shield,
    Users,
    UserCheck,
    Wrench,
    X,
} from 'lucide-react';
import { useState } from 'react';
import RoleBadge from '@/Components/RoleBadge';
import StudentPortalNav from '@/Components/StudentPortalNav';

function NavLink({ href, icon: Icon, label, active = false, badge = null }) {
    return (
        <Link
            href={href}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                    ? 'bg-primary-700 text-white shadow-sm'
                    : 'text-primary-100 hover:bg-primary-800/80 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
            </div>
            {badge && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-800 text-primary-200 font-semibold">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function NavSection({ title, children }) {
    return (
        <div className="pt-4">
            <p className="px-3 pb-1 text-[11px] font-bold text-primary-400/80 uppercase tracking-wider">
                {title}
            </p>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

export default function AuthenticatedLayout({ title = 'School Management', children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user || {};
    const permissions = user.permissions || [];
    const can = (permission) => permissions.includes(permission);
    const canAny = (...perms) => perms.some((p) => permissions.includes(p));

    const currentUrl = window.location.pathname;

    /*
     * Single source of truth for navigation. Every item declares the Spatie
     * permissions required to see it — role names are never used here. An item
     * (or its whole section) only renders when the authenticated user holds at
     * least one of the required permissions.
     */
    const navigation = [
        {
            section: 'Main Menu',
            items: [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                    active: currentUrl === '/dashboard',
                    permissions: [], // always available to authenticated users
                },
                {
                    label: 'Employees',
                    href: '/employees',
                    icon: Users,
                    active: currentUrl.startsWith('/employees'),
                    permissions: ['employees.view'],
                },
                {
                    label: 'User Accounts',
                    href: '/users',
                    icon: UserCheck,
                    active: currentUrl.startsWith('/users'),
                    permissions: ['users.view'],
                },
                {
                    label: 'Admissions',
                    href: '/admissions',
                    icon: ClipboardCheck,
                    active: currentUrl.startsWith('/admissions'),
                    permissions: ['admissions.view'],
                },
                {
                    label: 'Maintenance',
                    href: '/admin/maintenance',
                    icon: Wrench,
                    active: currentUrl.startsWith('/admin/maintenance'),
                    permissions: [],
                    superAdminOnly: true,
                },
            ].filter((item) =>
                item.superAdminOnly ? user.is_super_admin : canAny(...item.permissions),
            ),
        },
        {
            section: 'Student Management',
            items: [
                {
                    label: 'Student Directory',
                    href: '/students',
                    icon: GraduationCap,
                    active: currentUrl === '/students' || currentUrl.startsWith('/students/'),
                    permissions: ['students.view'],
                },
                {
                    label: 'Session Progression',
                    href: '/students/progression',
                    icon: UserCog,
                    active: currentUrl.startsWith('/students/progression'),
                    permissions: ['students.progress'],
                },
            ].filter((item) => canAny(...item.permissions)),
        },
        {
            section: 'Academic Setup',
            items: [
                {
                    label: 'Sessions & Terms',
                    href: '/academic/sessions',
                    icon: Calendar,
                    active: currentUrl.startsWith('/academic/sessions'),
                    permissions: ['sessions.view', 'terms.view', 'academic.view'],
                },
                {
                    label: 'Stages & Levels',
                    href: '/academic/structure',
                    icon: Layers,
                    active: currentUrl.startsWith('/academic/structure'),
                    permissions: ['stages.view', 'class_levels.view', 'academic.view'],
                },
                {
                    label: 'Classes & Arms',
                    href: '/academic/classes',
                    icon: School,
                    active: currentUrl.startsWith('/academic/classes'),
                    permissions: ['classes.view', 'academic.view'],
                },
                {
                    label: 'Subjects',
                    href: '/academic/subjects',
                    icon: BookOpen,
                    active: currentUrl.startsWith('/academic/subjects'),
                    permissions: ['subjects.view', 'academic.view'],
                },
            ].filter((item) => canAny(...item.permissions)),
        },
    ].filter((section) => section.items.length > 0);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [flashVisible, setFlashVisible] = useState(true);

    function handleLogout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title={title} />

            <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
                {/* ── Mobile Sidebar Backdrop ───────────────────────────── */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close navigation"
                        className="fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-xs md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ── Sidebar ───────────────────────────────────────────── */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-950 flex flex-col flex-shrink-0 transition-transform duration-200 md:relative md:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-primary-900/60">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 shadow-md">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-bold tracking-tight truncate leading-tight">
                                Greenwood Academy
                            </p>
                            <p className="text-primary-400 text-xs font-medium truncate">
                                School Management
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Close navigation"
                            className="text-primary-300 hover:text-white md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="sidebar-scrollbar flex-1 px-3 py-5 space-y-1.5 overflow-y-auto overscroll-contain">
                        {navigation.map((section) => (
                            <NavSection key={section.section} title={section.section}>
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.href}
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        active={item.active}
                                    />
                                ))}
                            </NavSection>
                        ))}
                        <StudentPortalNav active={currentUrl} />
                    </nav>

                    {/* Stage 3 Active Status & Logout Footer */}
                    <div className="p-3 border-t border-primary-900/60 space-y-2">
                        <div className="px-3 py-2 rounded-lg bg-primary-900/40 text-[11px] text-primary-300 flex items-center justify-between">
                            <span>Stage 3 Active</span>
                            <span className="font-semibold text-emerald-400">Academic Structure</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                text-primary-300 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* ── Main Area ─────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Open navigation"
                                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                                {title}
                            </h2>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-bold shadow-xs">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs font-semibold text-gray-900 leading-tight">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-gray-500">@{user.username}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-40 overflow-hidden animate-in fade-in duration-100">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <p className="text-xs font-bold text-gray-900">{user.name}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">@{user.username}</p>
                                            {user.email && (
                                                <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                                            )}
                                        </div>
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                                Assigned Role(s)
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <RoleBadge key={role} role={role} />
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No roles</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </header>

                    {/* ── Flash Notifications ───────────────────────────── */}
                    {flashVisible && (flash?.success || flash?.error) && (
                        <div className="px-6 pt-4 flex-shrink-0">
                            {flash?.success && (
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-xs animate-in fade-in">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                        <span>{flash.success}</span>
                                    </div>
                                    <button
                                        onClick={() => setFlashVisible(false)}
                                        className="text-emerald-600 hover:text-emerald-800 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {flash?.error && (
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm shadow-xs animate-in fade-in">
                                    <div className="flex items-center gap-2.5">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <span>{flash.error}</span>
                                    </div>
                                    <button
                                        onClick={() => setFlashVisible(false)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Main Scrollable Content ───────────────────────── */}
                    <main className="flex-1 overflow-y-auto p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
