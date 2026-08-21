'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp, resendOtp } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

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
    <div className="max-w-2xl mx-auto p-8 text-left bg-white text-black rounded-lg">
      <h1 className="text-4xl font-bold text-black!">Verify Your Email</h1>
      <p className="mt-2 text-black/70">
        We sent a {OTP_LENGTH}-digit code to <span className="font-semibold">{email}</span>. Enter it below to
        activate your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mt-6">
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
              className="w-12 h-14 text-center text-2xl font-bold rounded-md border border-black/15 bg-transparent text-black focus:outline-none focus:border-[#f29a4e]"
            />
          ))}
        </div>

        <button
          type="submit"
          className="inline-block px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Verifying...' : 'Verify & Create Account'}
        </button>
        {status === 'error' && <p className="error">{error}</p>}

        <p className="text-sm text-black/70">
          Didn&apos;t get the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendStatus === 'sending'}
            className="bg-transparent border-none p-0 font-[inherit] text-[#f29a4e] cursor-pointer hover:underline disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline"
          >
            {resendStatus === 'sending' ? 'Sending...' : cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
          </button>
        </p>
      </form>
    </div>
  );
}
