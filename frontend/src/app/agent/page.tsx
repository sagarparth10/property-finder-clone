'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { crmAPI } from '@/utils/api';
import { formatAed } from '@/utils/listings';

export default function AgentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    crmAPI.dashboard().then(setData).catch(() => setError('Could not load dashboard. Is the API running?'));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading workspace…</p>;

  const cards = [
    { label: 'Live listings', value: data.listings, href: '/agent/listings' },
    { label: 'Open leads', value: data.openLeads, href: '/agent/leads' },
    { label: 'New matches', value: data.newSuggestions, href: '/agent/matches' },
    { label: 'Pipeline', value: formatAed(data.pipelineValue || 0), href: '/agent/leads' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dealer workspace</h1>
      <p className="mt-1 text-sm text-gray-600">
        List inventory, claim buyer tickets from the pool, and let the backend auto-suggest matches.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-primary-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Pipeline stages</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(data.stages || []).map((stage: any) => (
            <div key={stage.id} className="rounded-xl bg-gray-50 px-3 py-3">
              <p className="text-xs text-gray-500">{stage.label}</p>
              <p className="text-lg font-semibold text-gray-900">{stage.count}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/agent/listings/new" className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
          Publish a listing
        </Link>
        <Link href="/agent/leads" className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          Work the lead board
        </Link>
      </div>
    </div>
  );
}
