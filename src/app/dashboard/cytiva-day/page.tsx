'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCytivaDayEntries,
  deleteCytivaDayEntry,
  exportCytivaDayEntries,
  getCytivaDaySession,
  advanceCytivaDaySession,
  resetCytivaDaySession,
  ApiError,
  type CytivaDayEntry,
  type CytivaDaySessionState,
} from '@/lib/api';
import { TableContainer, Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import ConfirmDialog from '@/components/ConfirmDialog';

const POLL_INTERVAL_MS = 5000;
const SESSION_POLL_INTERVAL_MS = 3000;

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function CytivaDayDashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState<CytivaDayEntry[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [tab, setTab] = useState<'live' | 'submissions' | 'leaderboard'>('live');
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CytivaDayEntry | null>(null);
  const [session, setSession] = useState<CytivaDaySessionState | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function load() {
      getCytivaDayEntries()
        .then((data) => {
          if (cancelled) return;
          setEntries(data.entries);
          setTotalQuestions(data.totalQuestions);
          setStatus('ready');
        })
        .catch((err) => {
          if (cancelled) return;
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            router.replace('/login');
            return;
          }
          setStatus('error');
        });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    function loadSession() {
      getCytivaDaySession()
        .then((data) => {
          if (cancelled) return;
          setSession(data);
        })
        .catch((err) => {
          if (cancelled) return;
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            router.replace('/login');
          }
        });
    }

    loadSession();
    const interval = setInterval(loadSession, SESSION_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdvance() {
    setAdvancing(true);
    try {
      await advanceCytivaDaySession();
      const data = await getCytivaDaySession();
      setSession(data);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace('/login');
        return;
      }
      window.alert((err as Error).message);
    } finally {
      setAdvancing(false);
    }
  }

  // Ending the quiz (vs. just moving to the next question) is harder to walk back — every
  // participant lands on their score page and a new "Start" goes straight to it too, until
  // someone resets — so this one step needs a deliberate confirmation.
  function handleAdvanceClick() {
    if (!session) return;
    if (session.currentQuestion + 1 === session.totalQuestions) {
      setShowFinishConfirm(true);
    } else {
      handleAdvance();
    }
  }

  async function handleFinishConfirmed() {
    setShowFinishConfirm(false);
    await handleAdvance();
  }

  async function handleResetConfirmed() {
    setResetting(true);
    try {
      await resetCytivaDaySession();
      const data = await getCytivaDaySession();
      setSession(data);
      setShowResetConfirm(false);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace('/login');
        return;
      }
      window.alert((err as Error).message);
    } finally {
      setResetting(false);
    }
  }

  // Live standings across everyone still on the quiz, not just those who've finished —
  // ranked by score so far, tie-broken by time so far.
  const leaderboard = useMemo(
    () =>
      entries
        .slice()
        .sort((a, b) => b.totalScore - a.totalScore || a.totalTimeSeconds - b.totalTimeSeconds),
    [entries]
  );

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportCytivaDayEntries();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cytiva-day.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace('/login');
        return;
      }
      window.alert((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  async function confirmDelete() {
    const entry = pendingDelete;
    if (!entry) return;
    setDeletingId(entry._id);
    try {
      await deleteCytivaDayEntry(entry._id);
      setEntries((prev) => prev.filter((e) => e._id !== entry._id));
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace('/login');
        return;
      }
      window.alert((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-8 text-left">
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-4 text-sm text-gray-500 no-underline hover:text-gray-900 transition-colors">
        &larr; Back to dashboard
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-1">Cytiva Day Quiz</h1>
        {status === 'ready' && entries.length > 0 && (
          <button type="button" className={buttonClasses()} onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        )}
      </div>
      <p className="text-gray-500 mb-6">Live quiz submissions and the current leaderboard.</p>

      <Tabs
        className="mb-6"
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'live', label: 'Live Control' },
          { key: 'submissions', label: `Submissions (${entries.length})` },
          { key: 'leaderboard', label: `Leaderboard${session && !session.completed ? ' (Live)' : ''} (${leaderboard.length})` },
        ]}
      />

      {tab === 'live' && !session && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock className="h-10 w-full" key={i} />
          ))}
        </div>
      )}

      {tab === 'live' && session && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Live Control</p>
              <h2 className="text-lg font-bold text-gray-900!">
                {session.currentQuestion < 0
                  ? 'Waiting room'
                  : session.completed
                    ? 'Quiz completed'
                    : `Question ${session.currentQuestion + 1} of ${session.totalQuestions}`}
              </h2>
            </div>
            <button
              type="button"
              className={buttonClasses({ variant: 'secondary', size: 'sm' })}
              onClick={() => setShowResetConfirm(true)}
            >
              Reset Quiz
            </button>
          </div>

          {session.currentQuestion < 0 && (
            <p className="text-sm text-gray-500 mb-4">
              {session.totalParticipants} participant{session.totalParticipants === 1 ? '' : 's'} waiting to start.
            </p>
          )}

          {!session.completed && session.question && (
            <>
              <p className="whitespace-pre-line text-sm text-gray-700 mb-4">{session.question.question}</p>
              <div className="flex flex-col gap-2 mb-4">
                {session.question.options.map((option, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-sm ${
                      i === session.question!.correctIndex ? 'border-success bg-success-subtle' : 'border-gray-200'
                    }`}
                  >
                    <span className={i === session.question!.correctIndex ? 'font-medium text-success' : 'text-gray-700'}>
                      {option}
                    </span>
                    <span className="font-semibold tabular-nums text-gray-500">{session.optionCounts[i] ?? 0}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {session.answeredCount} / {session.totalParticipants} participants answered
              </p>
            </>
          )}

          {!session.completed && (
            <button type="button" className={buttonClasses()} onClick={handleAdvanceClick} disabled={advancing}>
              {advancing
                ? session.currentQuestion < 0
                  ? 'Starting...'
                  : 'Advancing...'
                : session.currentQuestion < 0
                  ? 'Start Quiz'
                  : session.currentQuestion + 1 === session.totalQuestions
                    ? 'Finish Quiz'
                    : 'Next Question'}
            </button>
          )}
        </Card>
      )}

      {status === 'loading' && tab !== 'live' && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock className="h-10 w-full" key={i} />
          ))}
        </div>
      )}
      {status === 'error' && tab !== 'live' && <EmptyState title="Could not load quiz data" description="Please try again shortly." />}

      {status === 'ready' && tab === 'submissions' && entries.length === 0 && (
        <EmptyState title="No one has started the quiz yet" description="Names will show up here as soon as participants hit Start." />
      )}

      {status === 'ready' && tab === 'submissions' && entries.length > 0 && (
        <TableContainer>
          <Table>
            <Thead>
              <tr>
                {['Name', 'Status', 'Progress', 'Score', 'Total Time', 'Started', 'Completed', 'Actions'].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </Thead>
            <tbody>
              {entries.map((entry) => (
                <Tr key={entry._id}>
                  <Td className="font-medium text-gray-900">{entry.name}</Td>
                  <Td>
                    <Badge tone={entry.status === 'completed' ? 'success' : 'accent'}>
                      {entry.status === 'completed' ? 'Completed' : 'In progress'}
                    </Badge>
                  </Td>
                  <Td>
                    {entry.status === 'completed'
                      ? `${totalQuestions} / ${totalQuestions}`
                      : `${entry.answers.length} / ${totalQuestions}`}
                  </Td>
                  <Td>{entry.totalScore}</Td>
                  <Td>{entry.totalTimeSeconds}s</Td>
                  <Td>{new Date(entry.startedAt).toLocaleString()}</Td>
                  <Td>{entry.completedAt ? new Date(entry.completedAt).toLocaleString() : '—'}</Td>
                  <Td>
                    <button
                      type="button"
                      aria-label="Delete entry"
                      title="Delete entry"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-danger/30 bg-white text-danger cursor-pointer transition-all hover:bg-danger-subtle hover:border-danger disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => setPendingDelete(entry)}
                      disabled={deletingId === entry._id}
                    >
                      <DeleteIcon />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {status === 'ready' && tab === 'leaderboard' && leaderboard.length === 0 && (
        <EmptyState title="No one has started the quiz yet" description="Rankings update live here as participants answer each question." />
      )}

      {status === 'ready' && tab === 'leaderboard' && leaderboard.length > 0 && (
        <TableContainer>
          <Table>
            <Thead>
              <tr>
                {['Rank', 'Name', 'Status', 'Score', 'Time Taken', 'Completed', 'Actions'].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </Thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <Tr key={entry._id}>
                  <Td className="font-semibold text-gray-900">{i + 1}</Td>
                  <Td className="font-medium text-gray-900">{entry.name}</Td>
                  <Td>
                    <Badge tone={entry.status === 'completed' ? 'success' : 'accent'}>
                      {entry.status === 'completed' ? 'Completed' : `Q${entry.answers.length}/${totalQuestions}`}
                    </Badge>
                  </Td>
                  <Td>{entry.totalScore}</Td>
                  <Td>{entry.totalTimeSeconds}s</Td>
                  <Td>{entry.completedAt ? new Date(entry.completedAt).toLocaleString() : '—'}</Td>
                  <Td>
                    <button
                      type="button"
                      aria-label="Delete entry"
                      title="Delete entry"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-danger/30 bg-white text-danger cursor-pointer transition-all hover:bg-danger-subtle hover:border-danger disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => setPendingDelete(entry)}
                      disabled={deletingId === entry._id}
                    >
                      <DeleteIcon />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete quiz entry"
        message={pendingDelete ? `Delete "${pendingDelete.name}"'s quiz attempt? This can't be undone.` : ''}
        confirmLabel="Delete"
        confirming={deletingId === pendingDelete?._id}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset quiz"
        message="This sends everyone back to the waiting room until you click Start Quiz again. It does not delete any participant entries or scores."
        confirmLabel="Reset"
        confirming={resetting}
        onConfirm={handleResetConfirmed}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmDialog
        open={showFinishConfirm}
        title="Finish quiz"
        message="This ends the quiz for everyone right now — every participant is sent to their score page, and anyone new who hits Start will be told the quiz has ended, until you use Reset Quiz."
        confirmLabel="Finish Quiz"
        confirming={advancing}
        onConfirm={handleFinishConfirmed}
        onCancel={() => setShowFinishConfirm(false)}
      />
    </div>
  );
}
