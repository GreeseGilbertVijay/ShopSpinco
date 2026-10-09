'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import {
  getLabEssentialsEntryState,
  submitLabEssentialsAnswer,
  type LabEssentialsQuestionView,
} from '@/lib/api';

const POLL_INTERVAL_MS = 3000;

export default function QuestionClient({ pageIndex }: { pageIndex: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sid = searchParams.get('sid');
  const zeroBasedIndex = Number(pageIndex) - 1;

  const [question, setQuestion] = useState<LabEssentialsQuestionView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submittedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Self-paced: once the answer is recorded, move straight on to the next question (or the
  // results page after the last one) — no waiting for the host.
  const submitAnswer = useCallback(
    async (selected: number | null) => {
      if (!sid || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);

      try {
        const result = await submitLabEssentialsAnswer(sid, {
          questionIndex: zeroBasedIndex,
          selectedOption: selected,
        });
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        if (result.completed) {
          router.replace(`/lab-essentials-quiz/complete?sid=${sid}`);
        } else if (typeof result.currentQuestion === 'number') {
          router.replace(`/lab-essentials-quiz/question/${result.currentQuestion + 1}?sid=${sid}`);
        } else {
          router.replace(`/lab-essentials-quiz/waiting?sid=${sid}`);
        }
      } catch {
        submittedRef.current = false;
        setStatus('error');
        setSubmitting(false);
      }
    },
    [sid, zeroBasedIndex, router]
  );

  // Load (or resync) quiz state for this question, then start its stopwatch.
  useEffect(() => {
    if (!sid || Number.isNaN(zeroBasedIndex)) {
      router.replace('/lab-essentials-quiz');
      return;
    }
    let cancelled = false;

    getLabEssentialsEntryState(sid)
      .then((state) => {
        if (cancelled) return;
        if (state.status === 'completed') {
          router.replace(`/lab-essentials-quiz/complete?sid=${sid}`);
          return;
        }
        if (state.currentQuestion < 0) {
          router.replace(`/lab-essentials-quiz/waiting?sid=${sid}`);
          return;
        }
        if (state.currentQuestion !== zeroBasedIndex) {
          router.replace(`/lab-essentials-quiz/question/${state.currentQuestion + 1}?sid=${sid}`);
          return;
        }

        submittedRef.current = false;
        setSubmitting(false);
        setSelectedOption(null);
        setQuestion(state.question);
        setStatus('ready');

        // Anchor to how long the question has actually been live server-side (survives
        // a refresh), then keep counting locally from that baseline using our own clock —
        // this avoids relying on the client and server clocks being in sync.
        const baseline = state.currentQuestionElapsedSeconds;
        setElapsed(baseline);
        const fetchedAt = Date.now();
        tickRef.current = setInterval(() => {
          setElapsed(baseline + Math.floor((Date.now() - fetchedAt) / 1000));
        }, 250);
      })
      .catch(() => {
        if (!cancelled) router.replace('/lab-essentials-quiz');
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

  // Poll for the host ending (or resetting) the quiz while we're on a question.
  useEffect(() => {
    if (!sid || status === 'loading' || status === 'error') return;
    const poll = setInterval(() => {
      getLabEssentialsEntryState(sid)
        .then((state) => {
          if (state.status === 'completed') {
            router.replace(`/lab-essentials-quiz/complete?sid=${sid}`);
            return;
          }
          if (state.currentQuestion < 0) {
            router.replace(`/lab-essentials-quiz/waiting?sid=${sid}`);
            return;
          }
          if (state.currentQuestion !== zeroBasedIndex) {
            router.replace(`/lab-essentials-quiz/question/${state.currentQuestion + 1}?sid=${sid}`);
          }
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
      <Card className="w-full max-w-xl p-6 sm:p-8 shadow-lifted bg-[#fff8f1]! text-left">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#f29a4e]">
            Question {question.index + 1} of {question.total}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-[#f29a4e]">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {elapsed}s
          </span>
        </div>

        <h2 className="whitespace-pre-line text-left font-bold text-[#f29a4e]! mb-8 leading-snug">{question.question}</h2>

        <div className="flex flex-col gap-3 mb-8">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedOption(i)}
              disabled={submitting}
              className={`text-left px-4 py-3 rounded-lg border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-[#f29a4e] ${
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
          {submitting ? 'Submitting...' : question.index + 1 === question.total ? 'Submit & Finish' : 'Next Question'}
        </button>
      </Card>
    </div>
  );
}
