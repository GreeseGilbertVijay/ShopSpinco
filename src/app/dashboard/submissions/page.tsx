'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuotes, exportQuotes, ApiError, type Quote, type FreezeDryerDetails } from '@/lib/api';

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

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const createdDate = new Date(quote.createdAt).toISOString().slice(0, 10);
      const matchesFrom = !fromDate || createdDate >= fromDate;
      const matchesTo = !toDate || createdDate <= toDate;
      return matchesFrom && matchesTo;
    });
  }, [quotes, fromDate, toDate]);

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
