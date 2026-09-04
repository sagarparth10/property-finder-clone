'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { crmAPI } from '@/utils/api';
import { formatAed } from '@/utils/listings';

export default function MatchesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [notice, setNotice] = useState('');

  const load = () => crmAPI.suggestions().then(setRows);

  useEffect(() => {
    load().catch(() => setNotice('Could not load matches'));
  }, []);

  const act = async (id: string, status: string) => {
    await crmAPI.updateSuggestion(id, status);
    setNotice(status === 'accepted' ? 'Match accepted.' : 'Match dismissed.');
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Auto-matches</h1>
      <p className="mt-1 text-sm text-gray-600">
        Backend scoring pairs listings with buyer leads by area, intent, bedrooms, and budget. Dealers see ranked suggestions, not a shared inbox.
      </p>
      {notice && <p className="mt-4 text-sm text-primary-700">{notice}</p>}
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div key={row._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Score {row.score} · {row.kind}</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900">{row.property?.title || 'Listing'}</h2>
                <p className="text-sm text-gray-600">
                  {row.lead?.firstName} {row.lead?.lastName} · {row.lead?.locationPreference} · {formatAed(row.lead?.estimatedAmount || 0)}
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">{row.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(row.reasons || []).map((reason: string) => (
                <span key={reason} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">{reason}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              {row.property?._id && (
                <Link href={`/properties/${row.property._id}`} className="text-sm font-semibold text-primary-600">
                  View listing
                </Link>
              )}
              {row.status === 'new' && (
                <>
                  <button onClick={() => act(row._id, 'accepted')} className="text-sm font-semibold text-gray-800">Accept</button>
                  <button onClick={() => act(row._id, 'dismissed')} className="text-sm font-semibold text-gray-500">Dismiss</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!rows.length && <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">No matches yet. Publish a listing or wait for a buyer inquiry.</p>}
      </div>
    </div>
  );
}
