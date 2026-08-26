'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';
import PasswordField from '@/components/PasswordField';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setStatus('error');
      setError('Passwords do not match');
      return;
    }

    setStatus('submitting');
    try {
      const { email } = await register(form.name, form.email, form.password);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <div className="rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 items-stretch bg-white text-black rounded-xl overflow-hidden">
      <div className="relative hidden sm:block h-[80vh]">
        <img
          src="/Spinco%20Company.jpeg"
          alt="Spinco"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto lg:overflow-visible">
        <div className="w-full max-w-md text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-black!">Create Account</h1>
          <p className="text-black/60 mt-1 mb-6 sm:mb-8">Sign up to get started with your account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black/80 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e] focus:ring-2 focus:ring-[#f29a4e]/20 transition-all"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black/80 mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </span>
                <input
                  id="email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e] focus:ring-2 focus:ring-[#f29a4e]/20 transition-all"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 z-10">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <PasswordField
                  id="password"
                  className="pl-10 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e] focus:ring-2 focus:ring-[#f29a4e]/20 transition-all"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black/80 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 z-10">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <PasswordField
                  id="confirmPassword"
                  className="pl-10 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e] focus:ring-2 focus:ring-[#f29a4e]/20 transition-all"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 mt-2 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base font-medium transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Creating account...' : 'Create Account'}
              {status !== 'submitting' && (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {status === 'error' && <p className="error">{error}</p>}
          </form>

          <p className="mt-4 text-sm text-black/70 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-[#f29a4e] font-medium no-underline hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
