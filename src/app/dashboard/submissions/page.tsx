'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuotes, exportQuotes, deleteQuote, ApiError, type Quote, type FreezeDryerDetails } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

const FREEZE_DRYER_LIST_FIELDS: (keyof Omit<FreezeDryerDetails, 'comments'>)[] = [
  'organizationSegment',
  'primaryApplication',
  'sampleProductType',
  'intendedPurpose',
  'currentSetup',
  'expectedUsage',
  'purchaseTimeline',
];

function formatFreezeDryerDetails(details?: FreezeDryerDetails) {
  if (!details) return '';
  const lines = FREEZE_DRYER_LIST_FIELDS.filter((f) => details[f]?.length > 0).map((f) => `${f}: ${details[f].join(', ')}`);
  if (details.comments) lines.push(`comments: ${details.comments}`);
  return lines.join('; ');
}

export default function Submissions() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Quote | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const createdDate = new Date(quote.createdAt).toISOString().slice(0, 10);
      const matchesFrom = !fromDate || createdDate >= fromDate;
      const matchesTo = !toDate || createdDate <= toDate;
      return matchesFrom && matchesTo;
    });
  }, [quotes, fromDate, toDate]);

  const selectedVisibleIds = useMemo(
    () => filteredQuotes.filter((q) => selectedIds.has(q._id)).map((q) => q._id),
    [filteredQuotes, selectedIds]
  );
  const allVisibleSelected = filteredQuotes.length > 0 && selectedVisibleIds.length === filteredQuotes.length;

  const hasActiveFilters = fromDate !== '' || toDate !== '';

  function clearFilters() {
    setFromDate('');
    setToDate('');
  }

  useEffect(() => {
    getQuotes()
      .then((data) => {
        setQuotes(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace('/login');
          return;
        }
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    const quote = pendingDelete;
    if (!quote) return;
    setDeletingId(quote._id);
    try {
      await deleteQuote(quote._id);
      setQuotes((prev) => prev.filter((q) => q._id !== quote._id));
      setSelectedIds((prev) => {
        if (!prev.has(quote._id)) return prev;
        const next = new Set(prev);
        next.delete(quote._id);
        return next;
      });
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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredQuotes.forEach((q) => next.delete(q._id));
      } else {
        filteredQuotes.forEach((q) => next.add(q._id));
      }
      return next;
    });
  }

  async function confirmBulkDelete() {
    const ids = selectedVisibleIds;
    if (ids.length === 0) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => deleteQuote(id)));
      const succeededIds = ids.filter((_, i) => results[i].status === 'fulfilled');
      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      if (failures.some((r) => r.reason instanceof ApiError && (r.reason.status === 401 || r.reason.status === 403))) {
        router.replace('/login');
        return;
      }

      setQuotes((prev) => prev.filter((q) => !succeededIds.includes(q._id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        succeededIds.forEach((id) => next.delete(id));
        return next;
      });
      setPendingBulkDelete(false);

      if (failures.length > 0) {
        window.alert(`${failures.length} submission${failures.length > 1 ? 's' : ''} could not be deleted.`);
      }
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportQuotes({ from: fromDate, to: toDate });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'submissions.xlsx';
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

  return (
    <div className="max-w-6xl p-8 text-left bg-white text-black rounded-lg">
      <Link href="/dashboard" className="inline-block mb-4 text-inherit no-underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-4xl font-bold text-black!">Submissions</h1>

      {status === 'ready' && quotes.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <label className="flex flex-col gap-1 text-sm text-black/80">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black focus:outline-none focus:border-[#f29a4e]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-black/80">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2.5 rounded-md border border-black/15 bg-transparent text-black focus:outline-none focus:border-[#f29a4e]"
            />
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-[0.9rem] py-[0.55rem] rounded-md border border-black/15 bg-transparent text-black cursor-pointer transition-all hover:bg-black/10"
            >
              Clear filters
            </button>
          )}
          <button
            type="button"
            className="px-6 py-2.5 bg-[#f29a4e] text-black rounded-md cursor-pointer no-underline text-base transition-all hover:bg-[#dc8639] hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(242,154,78,0.35)] active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            onClick={handleExport}
            disabled={exporting || filteredQuotes.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
          {selectedVisibleIds.length > 0 && (
            <button
              type="button"
              className="px-6 py-2.5 bg-transparent border border-[#ff6b6b] text-[#ff6b6b] rounded-md cursor-pointer text-base transition-all hover:bg-[#ff6b6b] hover:text-black hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              onClick={() => setPendingBulkDelete(true)}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete selected (${selectedVisibleIds.length})`}
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <p className="text-black/80">Loading submissions...</p>}
      {status === 'error' && <p className="text-black/80">Could not load submissions.</p>}
      {status === 'ready' && quotes.length === 0 && <p className="text-black/80">No submissions yet.</p>}
      {status === 'ready' && quotes.length > 0 && filteredQuotes.length === 0 && (
        <p className="text-black/80 mt-6">No submissions match your filters.</p>
      )}

      {filteredQuotes.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr>
                <th className="px-3.5 py-2.5 border border-black/15 text-left text-sm font-semibold bg-[#f29a4e]/10">
                  <input
                    type="checkbox"
                    aria-label="Select all submissions"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                {[
                  'Date',
                  'Product',
                  'Selections',
                  'First Name',
                  'Last Name',
                  'Email',
                  'Phone',
                  'Street Address',
                  'Town/City',
                  'State',
                  'Pincode',
                  'Company Name',
                  'Role',
                  'Freeze Dryer Requirements',
                  'Actions',
                ].map((h) => (
                  <th key={h} className="px-3.5 py-2.5 border border-black/15 text-left text-sm font-semibold bg-[#f29a4e]/10">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote._id}>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">
                    <input
                      type="checkbox"
                      aria-label={`Select submission from ${[quote.firstName, quote.lastName].filter(Boolean).join(' ')}`}
                      checked={selectedIds.has(quote._id)}
                      onChange={() => toggleSelect(quote._id)}
                    />
                  </td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{new Date(quote.createdAt).toLocaleString()}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.productName}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">
                    {(quote.selections || []).map((s) => `${s.group}: ${s.option}`).join(', ')}
                  </td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.firstName}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.lastName}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.email}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.phone}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.streetAddress}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.city}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.state}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.pincode}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.companyName}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">{quote.role}</td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm whitespace-normal min-w-[220px]">
                    {formatFreezeDryerDetails(quote.freezeDryerDetails)}
                  </td>
                  <td className="px-3.5 py-2.5 border border-black/15 text-sm">
                    <button
                      type="button"
                      aria-label="Delete submission"
                      title="Delete submission"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[#ff6b6b] bg-transparent text-[#ff6b6b] cursor-pointer transition-all hover:bg-[#ff6b6b] hover:text-black hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      onClick={() => setPendingDelete(quote)}
                      disabled={deletingId === quote._id}
                    >
                      {deletingId === quote._id ? (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="animate-spin">
                          <path d="M21 12a9 9 0 1 1-9-9" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete submission"
        message={
          pendingDelete
            ? `Delete submission from "${[pendingDelete.firstName, pendingDelete.lastName].filter(Boolean).join(' ')}"? This can't be undone.`
            : ''
        }
        confirmLabel="Delete"
        confirming={deletingId === pendingDelete?._id}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingBulkDelete}
        title="Delete selected submissions"
        message={`Delete ${selectedVisibleIds.length} selected submission${selectedVisibleIds.length > 1 ? 's' : ''}? This can't be undone.`}
        confirmLabel="Delete"
        confirming={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setPendingBulkDelete(false)}
      />
    </div>
  );
}
