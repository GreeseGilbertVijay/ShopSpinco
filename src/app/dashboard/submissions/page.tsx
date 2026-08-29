'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuotes, exportQuotes, deleteQuote, ApiError, type Quote, type FreezeDryerDetails } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TableContainer, Table, Thead, Th, Tr, Td } from '@/components/ui/Table';
import { buttonClasses } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonBlock } from '@/components/ui/Skeleton';

const FREEZE_DRYER_LIST_FIELDS: (keyof Omit<FreezeDryerDetails, 'comments'>)[] = [
  'organizationSegment',
  'primaryApplication',
  'sampleProductType',
  'intendedPurpose',
  'currentSetup',
  'expectedUsage',
  'purchaseTimeline',
  'primaryApplicationField',
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
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 text-left">
      <Link href="/dashboard" className="inline-flex items-center gap-1 mb-4 text-sm text-gray-500 no-underline hover:text-gray-900 transition-colors">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900! mb-6">Submissions</h1>

      {status === 'ready' && quotes.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            />
          </label>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className={buttonClasses({ variant: 'ghost' })}>
              Clear filters
            </button>
          )}
          <button
            type="button"
            className={buttonClasses()}
            onClick={handleExport}
            disabled={exporting || filteredQuotes.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
          {selectedVisibleIds.length > 0 && (
            <button
              type="button"
              className={buttonClasses({ variant: 'danger' })}
              onClick={() => setPendingBulkDelete(true)}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete selected (${selectedVisibleIds.length})`}
            </button>
          )}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock className="h-10 w-full" key={i} />
          ))}
        </div>
      )}
      {status === 'error' && <EmptyState title="Could not load submissions" description="Please try again shortly." />}
      {status === 'ready' && quotes.length === 0 && <EmptyState title="No submissions yet" />}
      {status === 'ready' && quotes.length > 0 && filteredQuotes.length === 0 && (
        <EmptyState title="No submissions match your filters" />
      )}

      {filteredQuotes.length > 0 && (
        <TableContainer className="max-h-[70vh]">
          <Table className="whitespace-nowrap">
            <Thead>
              <tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all submissions"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                  />
                </Th>
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
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </Thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <Tr key={quote._id}>
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Select submission from ${[quote.firstName, quote.lastName].filter(Boolean).join(' ')}`}
                      checked={selectedIds.has(quote._id)}
                      onChange={() => toggleSelect(quote._id)}
                    />
                  </Td>
                  <Td>{new Date(quote.createdAt).toLocaleString()}</Td>
                  <Td>{quote.productName}</Td>
                  <Td>{(quote.selections || []).map((s) => `${s.group}: ${s.option}`).join(', ')}</Td>
                  <Td>{quote.firstName}</Td>
                  <Td>{quote.lastName}</Td>
                  <Td>{quote.email}</Td>
                  <Td>{quote.phone}</Td>
                  <Td>{quote.streetAddress}</Td>
                  <Td>{quote.city}</Td>
                  <Td>{quote.state}</Td>
                  <Td>{quote.pincode}</Td>
                  <Td>{quote.companyName}</Td>
                  <Td>{quote.role}</Td>
                  <Td className="whitespace-normal min-w-[220px]">{formatFreezeDryerDetails(quote.freezeDryerDetails)}</Td>
                  <Td>
                    <button
                      type="button"
                      aria-label="Delete submission"
                      title="Delete submission"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-danger/30 bg-white text-danger cursor-pointer transition-all hover:bg-danger-subtle hover:border-danger disabled:opacity-60 disabled:cursor-not-allowed"
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
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
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
