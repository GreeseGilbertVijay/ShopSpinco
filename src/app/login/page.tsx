'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import PasswordField from '@/components/PasswordField';

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
    <div className="max-w-2xl mx-auto p-8 text-left bg-white text-black rounded-lg">
      <h1 className="text-4xl font-bold text-black!">Log In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md">
        <input
          className="px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e]"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <PasswordField
          className="px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black placeholder-black/40 focus:outline-none focus:border-[#f29a4e]"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="inline-block mt-4 px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Logging in...' : 'Log In'}
        </button>
        {status === 'error' && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
