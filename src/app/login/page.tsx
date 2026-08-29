'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import PasswordField from '@/components/PasswordField';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';

export default function Login() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await login(form.email, form.password);
      await refresh();
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.unverified) {
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Log In"
      subtitle="Enter your credentials to access your account."
      footer={
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent-hover font-medium no-underline hover:underline">
            Register
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            }
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <PasswordField
            id="password"
            className="rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
        </div>

        <button type="submit" className={buttonClasses({ size: 'lg', className: 'w-full sm:w-auto mt-2' })} disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Logging in...' : 'Log In'}
          {status !== 'submitting' && (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </button>
        {status === 'error' && <p className="error">{error}</p>}
      </form>
    </AuthLayout>
  );
}
