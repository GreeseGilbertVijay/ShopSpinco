'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { getCytivaDayEntryState } from '@/lib/api';

export default function CytivaDayCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sid = searchParams.get('sid');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [name, setName] = useState('');
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  useEffect(() => {
    if (!sid) {
      router.replace('/cytiva-day');
      return;
    }
    let cancelled = false;

    getCytivaDayEntryState(sid)
      .then((state) => {
        if (cancelled) return;
        if (state.status !== 'completed') {
          if (state.currentQuestion < 0) {
            router.replace(`/cytiva-day/waiting?sid=${sid}`);
          } else {
            router.replace(`/cytiva-day/question/${state.currentQuestion + 1}?sid=${sid}`);
          }
          return;
        }
        setName(state.name);
        setScore(state.totalScore);
        setMaxScore(state.totalQuestions * state.marksPerQuestion);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [sid, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 sm:p-10 text-center shadow-lifted bg-[#e4f7f4]!">
        {status === 'loading' && <p className="text-gray-500">Loading your result...</p>}
        {status === 'error' && <p className="text-gray-500">Couldn&apos;t load your result. Please contact the organizers.</p>}

        {status === 'ready' && (
          <>
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-subtle text-success mb-4">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h1 className="text-2xl! sm:text-4xl! font-bold text-[#008f88]! mb-1">Nice work, {name}!</h1>
            <p className="text-sm sm:text-base text-[#008f88] mb-6">You&apos;ve completed the Cytiva Day quiz.</p>

            <div className="rounded-xl bg-accent-subtle px-6 py-5">
              <p className="text-xs uppercase tracking-wide text-[#008f88] mb-1">Your score</p>
              <p className="text-3xl sm:text-4xl font-bold text-[#008f88]!">
                {score} <span className="text-base sm:text-lg font-medium text-[#008f88]">/ {maxScore}</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#008f88] mt-6">Final Rankings Will be Announced by the Organizers.</p>
          </>
        )}
      </Card>
    </div>
  );
}
