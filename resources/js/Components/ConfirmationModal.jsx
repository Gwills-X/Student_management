import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    processing = false,
    onConfirm,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-lg p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div
                        className={`flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 ${
                            isDanger ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'
                        }`}
                    >
                        <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900">
                            {title}
                        </h3>
                        <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                        }`}
                    >
                        {processing ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
