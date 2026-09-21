'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import {
  getCytivaDayEntryState,
  submitCytivaDayAnswer,
  type CytivaDayQuestionView,
} from '@/lib/api';

const POLL_INTERVAL_MS = 3000;

export default function QuestionClient({ pageIndex }: { pageIndex: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sid = searchParams.get('sid');
  const zeroBasedIndex = Number(pageIndex) - 1;

  const [question, setQuestion] = useState<CytivaDayQuestionView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'waiting' | 'error'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);

  const submittedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const submitAnswer = useCallback(
    async (selected: number | null) => {
      if (!sid || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);

      try {
        await submitCytivaDayAnswer(sid, {
          questionIndex: zeroBasedIndex,
          selectedOption: selected,
        });
        // Freeze the on-screen timer at the moment of submission instead of letting it
        // keep counting through the wait for the host to advance.
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        setStatus('waiting');
      } catch {
        submittedRef.current = false;
        setStatus('error');
      } finally {
        setSubmitting(false);
      }
    },
    [sid, zeroBasedIndex]
  );

  // Load (or resync) quiz state for this question, then start its stopwatch.
  useEffect(() => {
    if (!sid || Number.isNaN(zeroBasedIndex)) {
      router.replace('/cytiva-day');
      return;
    }
    let cancelled = false;

    getCytivaDayEntryState(sid)
      .then((state) => {
        if (cancelled) return;
        if (state.status === 'completed') {
          router.replace(`/cytiva-day/complete?sid=${sid}`);
          return;
        }
        if (state.currentQuestion !== zeroBasedIndex) {
          router.replace(`/cytiva-day/question/${state.currentQuestion + 1}?sid=${sid}`);
          return;
        }

        submittedRef.current = state.waiting;
        setSelectedOption(null);
        setQuestion(state.question);
        setAnsweredCount(state.answeredCount ?? null);
        setTotalParticipants(state.totalParticipants ?? null);
        setStatus(state.waiting ? 'waiting' : 'ready');

        // Anchor to how long the question has actually been live server-side (survives
        // a refresh), then keep counting locally from that baseline using our own clock —
        // this avoids relying on the client and server clocks being in sync. If we've
        // already answered (e.g. reloaded while waiting), leave the timer frozen.
        const baseline = state.currentQuestionElapsedSeconds;
        setElapsed(baseline);
        if (!state.waiting) {
          const fetchedAt = Date.now();
          tickRef.current = setInterval(() => {
            setElapsed(baseline + Math.floor((Date.now() - fetchedAt) / 1000));
          }, 250);
        }
      })
      .catch(() => {
        if (!cancelled) router.replace('/cytiva-day');
      });

    return () => {
      cancelled = true;
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, pageIndex]);

  // Poll for the host advancing (or ending) the quiz — this can happen whether we've
  // already answered and are waiting, or we're still looking at the question.
  useEffect(() => {
    if (!sid || status === 'loading' || status === 'error') return;
    const poll = setInterval(() => {
      getCytivaDayEntryState(sid)
        .then((state) => {
          if (state.status === 'completed') {
            router.replace(`/cytiva-day/complete?sid=${sid}`);
            return;
          }
          if (state.currentQuestion !== zeroBasedIndex) {
            router.replace(`/cytiva-day/question/${state.currentQuestion + 1}?sid=${sid}`);
            return;
          }
          setAnsweredCount(state.answeredCount ?? null);
          setTotalParticipants(state.totalParticipants ?? null);
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [sid, zeroBasedIndex, status, router]);

  function handleManualSubmit() {
    if (selectedOption === null || !question) return;
    submitAnswer(selectedOption);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500">Loading question...</p>
      </div>
    );
  }

  if (status === 'error' || !question) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center">
          <p className="text-gray-900 font-medium mb-4">Something went wrong loading this question.</p>
          <button type="button" className={buttonClasses()} onClick={() => window.location.reload()}>
            Try again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl p-6 sm:p-8 shadow-lifted bg-[#e4f7f4]! text-left">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#008f88]">
            Question {question.index + 1} of {question.total}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-[#008f88]">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {elapsed}s
          </span>
        </div>

        <h2 className="whitespace-pre-line text-left font-bold text-[#008f88]! mb-8 leading-snug">{question.question}</h2>

        {status === 'waiting' ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-subtle text-[#008f88]">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <p className="text-[#008f88] font-semibold">Answer submitted!</p>
            <p className="text-sm text-[#008f88]/80">Waiting for the host to move to the next question&hellip;</p>
            {answeredCount !== null && totalParticipants !== null && (
              <p className="text-xs font-semibold tabular-nums text-[#008f88] bg-white/60 rounded-full px-3 py-1">
                {answeredCount} / {totalParticipants} participants answered
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-8">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedOption(i)}
                  disabled={submitting}
                  className={`text-left px-4 py-3 rounded-lg border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-[#008f88] ${
                    selectedOption === i
                      ? 'border-accent bg-accent-subtle'
                      : 'border-gray-200 bg-white hover:border-accent/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={buttonClasses({ size: 'lg', className: 'w-full' })}
              onClick={handleManualSubmit}
              disabled={selectedOption === null || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </>
        )}
      </Card>
    </div>
  );
}
