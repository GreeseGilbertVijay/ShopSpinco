'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { getCytivaDayEntryState } from '@/lib/api';

const POLL_INTERVAL_MS = 2500;

export default function WaitingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sid = searchParams.get('sid');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [name, setName] = useState('');
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);

  useEffect(() => {
    if (!sid) {
      router.replace('/cytiva-day');
      return;
    }
    let cancelled = false;

    function poll() {
      getCytivaDayEntryState(sid!)
        .then((state) => {
          if (cancelled) return;
          if (state.status === 'completed') {
            router.replace(`/cytiva-day/complete?sid=${sid}`);
            return;
          }
          if (state.currentQuestion >= 0) {
            router.replace(`/cytiva-day/question/${state.currentQuestion + 1}?sid=${sid}`);
            return;
          }
          setName(state.name);
          setTotalParticipants(state.totalParticipants ?? null);
          setStatus('ready');
        })
        .catch(() => {
          if (!cancelled) setStatus('error');
        });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6 sm:p-10 text-center shadow-lifted bg-[#e4f7f4]!">
        {status === 'loading' && <p className="text-gray-500">Loading...</p>}
        {status === 'error' && <p className="text-gray-500">Couldn&apos;t load your status. Please contact the organizers.</p>}

        {status === 'ready' && (
          <>
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-subtle text-[#008f88] mb-4 animate-pulse">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </span>
            <h1 className="text-2xl! sm:text-4xl! font-bold text-[#008f88]! mb-1">You&apos;re in, {name}!</h1>
            <p className="text-sm sm:text-base text-[#008f88] mb-6">Waiting for the host to start the quiz&hellip;</p>
            {totalParticipants !== null && (
              <p className="text-xs font-semibold tabular-nums text-[#008f88] bg-white/60 rounded-full px-3 py-1 inline-block">
                {totalParticipants} participant{totalParticipants === 1 ? '' : 's'} waiting
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
