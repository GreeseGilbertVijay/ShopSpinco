'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';
import PasswordField from '@/components/PasswordField';

const inputCls =
  'px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e]';

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
    <div className="max-w-2xl mx-auto p-8 text-left bg-white text-black rounded-lg">
      <h1 className="text-4xl font-bold text-black!">Create Account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md">
        <input className={inputCls} name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input className={inputCls} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <PasswordField
          className={inputCls}
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />
        <PasswordField
          className={inputCls}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          minLength={6}
          required
        />
        <button
          type="submit"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Creating account...' : 'Create Account'}
        </button>
        {status === 'error' && <p className="error">{error}</p>}
      </form>
      <p className="mt-4 text-sm text-black/70">
        Already have an account?{' '}
        <Link href="/login" className="text-[#f29a4e] no-underline hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
