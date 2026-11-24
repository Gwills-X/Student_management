import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links = [] }) {
    if (links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="hidden sm:block">
                <p className="text-xs text-gray-500">
                    Showing pages of available records
                </p>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
                {links.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed select-none"
                            />
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                link.active
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        />
                    );
                })}
            </div>
        </nav>
    );
}
