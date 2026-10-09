'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword, resetPassword } from '@/lib/api';
import PasswordField from '@/components/PasswordField';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';

const RESEND_COOLDOWN = 30;

const passwordFieldClasses =
  'rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2.5 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors';

const lockIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [form, setForm] = useState({ email: '', code: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending'>('idle');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await forgotPassword(form.email);
      setStep('reset');
      setCooldown(RESEND_COOLDOWN);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  async function handleResend() {
    setResendStatus('sending');
    setError('');
    try {
      await forgotPassword(form.email);
      setForm({ ...form, code: '' });
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    } finally {
      setResendStatus('idle');
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus('error');
      setError('Passwords do not match');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      await resetPassword(form.email, form.code, form.password);
      router.push('/login?reset=1');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle={
        step === 'email' ? (
          'Enter your account email and we will send you a code to reset your password.'
        ) : (
          <>
            We sent a 6-digit code to <span className="font-semibold text-gray-800">{form.email}</span>. Enter the
            code and choose a new password. Check your spam folder if you don&apos;t see it.
          </>
        )
      }
      footer={
        <p className="mt-4 text-sm text-gray-600 text-center">
          Remembered it?{' '}
          <Link href="/login" className="text-accent-hover font-medium no-underline hover:underline">
            Back to Log In
          </Link>
        </p>
      }
    >
      {step === 'email' ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-4 w-full">
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

          <button type="submit" className={buttonClasses({ size: 'lg', className: 'w-full sm:w-auto mt-2' })} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send Reset Code'}
          </button>
          {status === 'error' && <p className="error">{error}</p>}
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
              Reset Code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <PasswordField
              id="password"
              className={passwordFieldClasses}
              name="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
              icon={lockIcon}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <PasswordField
              id="confirmPassword"
              className={passwordFieldClasses}
              name="confirmPassword"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              minLength={6}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              icon={lockIcon}
            />
          </div>

          <button type="submit" className={buttonClasses({ size: 'lg', className: 'w-full sm:w-auto mt-2' })} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
          </button>
          {status === 'error' && <p className="error">{error}</p>}

          <p className="text-sm text-gray-600">
            Didn&apos;t get the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendStatus === 'sending'}
              className="bg-transparent border-none p-0 font-[inherit] text-accent-hover cursor-pointer hover:underline disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline"
            >
              {resendStatus === 'sending' ? 'Sending...' : cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
            </button>
            {' · '}
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setStatus('idle');
                setError('');
              }}
              className="bg-transparent border-none p-0 font-[inherit] text-accent-hover cursor-pointer hover:underline"
            >
              Use a different email
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
