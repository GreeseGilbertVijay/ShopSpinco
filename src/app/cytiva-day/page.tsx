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
  const [ended, setEnded] = useState(false);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await startCytivaDay(name.trim());
      if ('ended' in result) {
        setEnded(true);
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem('cytivaDayId', result.id);
      if ('waiting' in result) {
        router.push(`/cytiva-day/waiting?sid=${result.id}`);
      } else {
        router.push(`/cytiva-day/question/${result.currentQuestion + 1}?sid=${result.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start the quiz. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 text-center shadow-lifted bg-[#e4f7f4]!">
        <h1 className="text-2xl! sm:text-4xl! font-bold text-[#008f88]! mb-1">Cytiva Day Quiz</h1>

        {ended ? (
          <p className="text-sm sm:text-base text-[#008f88] mt-4">
            This quiz has already ended. Please check with the organizers for the results.
          </p>
        ) : (
          <form onSubmit={handleStart} className="flex flex-col gap-4 text-left">
            <label className="flex flex-col gap-1.5 text-xs sm:text-sm font-medium text-[#008f88]">
              Name
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoFocus
                required
                className="border-[#008f88]! focus:border-[#008f88]! focus:ring-[#008f88]/20! text-sm! sm:text-base!"
              />
            </label>

            {error && <p className="text-xs sm:text-sm text-danger">{error}</p>}

            <button type="submit" className={buttonClasses({ size: 'lg', className: 'w-full text-sm! sm:text-base!' })} disabled={!name.trim() || submitting}>
              {submitting ? 'Starting...' : 'Start'}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
