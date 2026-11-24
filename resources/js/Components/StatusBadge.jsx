export default function StatusBadge({ status, type = 'employment' }) {
    if (type === 'account') {
        const isActive = Boolean(status);
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {isActive ? 'Active' : 'Inactive'}
            </span>
        );
    }

    // Employment Status styles
    const styles = {
        Active:     'bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald',
        'On Leave': 'bg-amber-50 text-amber-700 border-amber-200 dot-amber',
        Suspended:  'bg-red-50 text-red-700 border-red-200 dot-red',
        Retired:    'bg-purple-50 text-purple-700 border-purple-200 dot-purple',
        Resigned:   'bg-gray-100 text-gray-700 border-gray-300 dot-gray',
        Terminated: 'bg-rose-100 text-rose-800 border-rose-300 dot-rose',
    };

    const dotColors = {
        Active:     'bg-emerald-500',
        'On Leave': 'bg-amber-500',
        Suspended:  'bg-red-500',
        Retired:    'bg-purple-500',
        Resigned:   'bg-gray-500',
        Terminated: 'bg-rose-600',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                styles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] ?? 'bg-gray-400'}`} />
            {status}
        </span>
    );
}
