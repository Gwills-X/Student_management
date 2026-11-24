import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, GraduationCap, Lock, User } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/login', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Sign In" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo / branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            School Management
                        </h1>
                        <p className="mt-1 text-primary-200 text-sm">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Global error banner */}
                        {(errors.username || errors.password) && (
                            <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700">
                                    {errors.username || errors.password}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Username */}
                            <div className="mb-5">
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <User className="w-4 h-4 text-gray-400" />
                                    </span>
                                    <input
                                        id="username"
                                        type="text"
                                        autoComplete="username"
                                        autoFocus
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        disabled={processing}
                                        className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400
                                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                            disabled:bg-gray-50 disabled:cursor-not-allowed transition
                                            ${errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-5">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400
                                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                            disabled:bg-gray-50 disabled:cursor-not-allowed transition
                                            ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center mb-6">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    disabled={processing}
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Keep me signed in
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                                    bg-primary-600 hover:bg-primary-700 active:bg-primary-800
                                    text-white text-sm font-semibold
                                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    transition-colors"
                            >
                                {processing ? (
                                    <>
                                        <svg
                                            className="animate-spin w-4 h-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer note */}
                    <p className="mt-6 text-center text-xs text-primary-300">
                        Don&apos;t have an account? Contact your school administrator.
                    </p>
                </div>
            </div>
        </>
    );
}
