'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';
import { startCytivaDay, ApiError } from '@/lib/api';

export default function CytivaDayStartPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { id } = await startCytivaDay(name.trim());
      sessionStorage.setItem('cytivaDayId', id);
      router.push(`/cytiva-day/question/1?sid=${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start the quiz. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 text-center shadow-lifted">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-subtle text-accent-hover mb-4">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2 2 7l10 5 10-5-10-5Z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-1">Cytiva Day Quiz</h1>
        <form onSubmit={handleStart} className="flex flex-col gap-4 text-left">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            Name
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoFocus
              required
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button type="submit" className={buttonClasses({ size: 'lg', className: 'w-full' })} disabled={!name.trim() || submitting}>
            {submitting ? 'Starting...' : 'Start'}
          </button>
        </form>
      </Card>
    </div>
  );
}
