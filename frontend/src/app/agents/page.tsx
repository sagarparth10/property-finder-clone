'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { mockAgents } from '@/data/mockData';
import { UserCircle, Star, MessageSquare } from 'lucide-react';

const SPECIALISATIONS = ['All', 'Luxury', 'Residential', 'Commercial'];

export default function AgentsPage() {
  const [filter, setFilter] = useState('All');

  const filteredAgents = useMemo(() => {
    if (filter === 'All') return mockAgents;
    return mockAgents.filter((agent) => agent.specialization?.toLowerCase().includes(filter.toLowerCase()));
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Meet our elite agents & brokers</h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Connect with specialists who combine deep market knowledge, lightning-fast response times, and AI-powered lead analytics.
          </p>
        </div>
        <Link
          href="/portals"
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <UserCircle className="h-4 w-4" /> Join the agent network
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {SPECIALISATIONS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              filter === item ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="h-16 w-16 rounded-full border-4 border-primary-100 object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.specialization}</p>
                <div className="mt-1 inline-flex items-center gap-1 text-sm text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" /> {agent.rating}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Experience</p>
                <p>{agent.experience}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Listings</p>
                <p>{agent.listings}+ active</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Success rate</p>
                <p>{agent.successRate}%</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Languages</p>
                <p>{agent.languages?.join(', ')}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-primary-50 p-4 text-sm text-primary-700">
              <p className="font-semibold uppercase tracking-wide">Performance Snapshot</p>
              <p className="mt-1">Generated AED {(agent.totalSales / 1_000_000).toFixed(1)}M+ in closed transactions.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/agents/${agent.id}`}
                className="flex-1 rounded-full bg-primary-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                View profile
              </Link>
              <Link
                href="/contact"
                className="flex-1 rounded-full border border-primary-200 px-4 py-2 text-center text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Request intro
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
