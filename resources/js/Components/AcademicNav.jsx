import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Layers,
    School,
} from 'lucide-react';

export default function AcademicNav({ currentTab = 'sessions' }) {
    const tabs = [
        { id: 'sessions', label: 'Sessions & Terms', href: '/academic/sessions', icon: Calendar },
        { id: 'structure', label: 'Stages & Levels', href: '/academic/structure', icon: Layers },
        { id: 'classes', label: 'Classes & Arms', href: '/academic/classes', icon: School },
        { id: 'subjects', label: 'Subjects Catalog', href: '/academic/subjects', icon: BookOpen },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                            isActive
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
