'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp, resendOtp } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import AuthLayout from '@/components/ui/AuthLayout';
import { buttonClasses } from '@/components/ui/Button';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.replace('/register');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const next = [...digits];
    clean.split('').forEach((char, offset) => {
      if (index + offset < OTP_LENGTH) next[index + offset] = char;
    });
    setDigits(next);

    const nextIndex = Math.min(index + clean.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setStatus('error');
      setError(`Enter all ${OTP_LENGTH} digits`);
      return;
    }

    setStatus('submitting');
    setError('');
    try {
      await verifyOtp(email, otp);
      await refresh();
      router.push('/');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  async function handleResend() {
    setResendStatus('sending');
    setError('');
    try {
      await resendOtp(email);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('idle');
      setError((err as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={
        <>
          We sent a {OTP_LENGTH}-digit code to <span className="font-semibold text-gray-800">{email}</span>. Enter
          it below to activate your account.
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          className={buttonClasses({ size: 'lg', className: 'w-full sm:w-auto' })}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Verifying...' : 'Verify & Create Account'}
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
        </p>
      </form>
    </AuthLayout>
  );
}
