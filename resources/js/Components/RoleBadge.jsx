export default function RoleBadge({ role }) {
    const colours = {
        'Super Administrator': 'bg-purple-100 text-purple-800 border-purple-200',
        Administrator:         'bg-blue-100 text-blue-800 border-blue-200',
        Principal:             'bg-indigo-100 text-indigo-800 border-indigo-200',
        Registrar:             'bg-teal-100 text-teal-800 border-teal-200',
        Teacher:               'bg-green-100 text-green-800 border-green-200',
        'Form Master':         'bg-amber-100 text-amber-800 border-amber-200',
        'Assistant Form Master': 'bg-orange-100 text-orange-800 border-orange-200',
        Student:               'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                colours[role] ?? 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
        >
            {role}
        </span>
    );
}
