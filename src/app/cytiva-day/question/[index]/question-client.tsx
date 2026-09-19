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

export default function QuestionClient({ pageIndex }: { pageIndex: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sid = searchParams.get('sid');
  const zeroBasedIndex = Number(pageIndex) - 1;

  const [question, setQuestion] = useState<CytivaDayQuestionView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submittedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const submitAnswer = useCallback(
    async (selected: number | null) => {
      if (!sid || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      try {
        const result = await submitCytivaDayAnswer(sid, {
          questionIndex: zeroBasedIndex,
          selectedOption: selected,
        });

        if (result.completed) {
          router.replace(`/cytiva-day/complete?sid=${sid}`);
        } else if (result.nextQuestion) {
          router.replace(`/cytiva-day/question/${result.nextQuestion.index + 1}?sid=${sid}`);
        } else if (typeof result.currentQuestion === 'number') {
          // Server says we're out of sync (e.g. duplicate submit) — jump to where it actually is.
          router.replace(`/cytiva-day/question/${result.currentQuestion + 1}?sid=${sid}`);
        }
      } catch {
        submittedRef.current = false;
        setSubmitting(false);
        setStatus('error');
      }
    },
    [sid, zeroBasedIndex, router]
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
        if (state.currentQuestion !== zeroBasedIndex || !state.question) {
          router.replace(`/cytiva-day/question/${state.currentQuestion + 1}?sid=${sid}`);
          return;
        }

        submittedRef.current = false;
        setSelectedOption(null);
        setQuestion(state.question);
        setStatus('ready');

        // Anchor to how long the question has actually been running server-side (survives
        // a refresh), then keep counting locally from that baseline using our own clock —
        // this avoids relying on the client and server clocks being in sync.
        const baseline = state.currentQuestionElapsedSeconds;
        const fetchedAt = Date.now();
        setElapsed(baseline);
        intervalRef.current = setInterval(() => {
          setElapsed(baseline + Math.floor((Date.now() - fetchedAt) / 1000));
        }, 250);
      })
      .catch(() => {
        if (!cancelled) router.replace('/cytiva-day');
      });

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, pageIndex]);

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

        <h1 className="whitespace-pre-line text-left text-xl sm:text-2xl font-bold text-[#008f88]! mb-6 leading-snug">{question.question}</h1>

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
          {submitting ? 'Submitting...' : question.index + 1 === question.total ? 'Submit Final Answer' : 'Submit & Next'}
        </button>
      </Card>
    </div>
  );
}
