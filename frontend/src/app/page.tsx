'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ListingCard } from '@/components/ListingCard/ListingCard';
import { AIAvatar } from '@/components/Avatar/AIAvatar';
import { PropertyMap } from '@/components/Map/PropertyMap';
import {
  mockProperties,
  mockPriceTrends,
  mockNeighborhoodInsights,
  mockMortgageOptions,
} from '@/data/mockData';
import {
  Search,
  Filter,
  Map as MapIcon,
  List,
  Sparkles,
  ShieldCheck,
  Users,
  BarChart3,
  Building2,
  ArrowRight,
} from 'lucide-react';

const FEATURE_TAGS = ['Waterfront', 'Verified Only', 'Smart Homes', 'Ready to Move', 'Off-plan Projects'];

const WHY_CHOOS_US = [
  {
    icon: <ShieldCheck className="h-6 w-6 text-primary-600" />,
    title: 'Verified + Secure',
    description: 'Listings audited by lawyers, surveyors, and AI-driven fraud detection for total confidence.',
  },
  {
    icon: <Sparkles className="h-6 w-6 text-primary-600" />,
    title: 'AI-Powered Guidance',
    description: 'Multilingual avatar that understands your lifestyle needs and curates bespoke property journeys.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary-600" />,
    title: 'Market Intelligence',
    description: 'Live price trends, yield forecasts, and neighborhood insights powered by predictive analytics.',
  },
  {
    icon: <Users className="h-6 w-6 text-primary-600" />,
    title: '360° Expert Network',
    description: 'Agents, brokers, lawyers, mortgage advisors, and surveyors collaborating in one secure workspace.',
  },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 py-20 text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url(/images/pattern-grid.svg)' }} />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Next-Gen Real Estate Platform
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Discover, tour, and secure UAE properties with an AI co-pilot.
            </h1>
            <p className="text-lg text-white/80">
              Property Nexus unifies property search, legal verification, financing, and post-deal services in a single, intelligent workspace.
            </p>

            <div className="rounded-2xl bg-white/10 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3 text-gray-700">
                  <Search className="h-5 w-5 text-primary-600" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none"
                    placeholder="Search Dubai Marina apartments under AED 200k..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/30">
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                  </button>
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                  >
                    Search Properties
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {FEATURE_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: '15K+', label: 'Verified Listings' },
                { value: '540+', label: 'Top Agents & Brokers' },
                { value: '98%', label: 'Client Satisfaction' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4 shadow-inner">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-white/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-primary-500/80 to-primary-300/80" />
            <div className="relative p-6">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">AI Concierge</p>
                  <p>Ask anything about your next property journey.</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white shadow-lg">
                <AIAvatar
                  onUserInput={(text) => console.log('Hero Avatar Input', text)}
                  avatarResponse={null}
                  isListening={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings & Map */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured properties across the UAE</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Curated homes that are personally verified, digitally staged, and mortgage-ready.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === 'grid' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                viewMode === 'map' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="h-4 w-4" /> Map
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mockProperties.slice(0, 6).map((property) => (
              <ListingCard
                key={property.id}
                property={property}
                onView={(id) => setSelectedProperty(id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 h-[600px] overflow-hidden rounded-3xl border border-gray-200 shadow-xl">
            <PropertyMap
              properties={mockProperties.map((p) => ({
                id: p.id,
                lat: p.lat,
                lng: p.lng,
                title: p.title,
                price: p.price,
                image: p.image,
              }))}
              onPropertyClick={(id) => setSelectedProperty(id)}
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-primary-600/10 via-primary-500/10 to-primary-400/10 px-6 py-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
              Everything stays synchronized
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              Track leads, inspections, and legal docs inside a unified pipeline.
            </h3>
          </div>
          <Link
            href="/portals"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary-700"
          >
            Explore the Portals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Built for modern real estate journeys</h2>
            <p className="mx-auto max-w-3xl text-sm text-gray-600">
              From first search to post-handover services, Property Nexus blends human expertise and intelligent automation.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {WHY_CHOOS_US.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Dubai Marina price trajectory</h3>
              <Link className="text-sm font-semibold text-primary-600" href="/insights">
                View market insights
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {mockPriceTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">{trend.month}</span>
                  <span className="text-sm font-semibold text-primary-600">AED {trend.average.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Neighborhood intelligence snapshot</h3>
            <dl className="mt-6 grid gap-4">
              {Object.entries(mockNeighborhoodInsights).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <dt className="text-sm font-semibold capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="text-sm font-medium text-primary-600">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {mockMortgageOptions.map((option) => (
            <div key={option.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                {option.bank}
              </p>
              <h4 className="mt-3 text-lg font-semibold text-gray-900">{option.interestRate}% {option.type} • {option.duration}</h4>
              <p className="mt-2 text-sm text-gray-600">
                Finance portfolio-ready buyers with on-platform mortgage partners and instant pre-approvals.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Portals overview */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Portals engineered for every stakeholder</h2>
              <p className="text-sm text-gray-600">
                Agents, developers, lawyers, surveyors, and mortgage advisors collaborate through dedicated workspaces with configurable permissions and real-time data sync.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[ 'Agent CRM + lead routing', 'Developer launch cockpit', 'Lawyer compliance desk', 'Mortgage pre-approval hub' ].map((item) => (
                  <div key={item} className="rounded-2xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/portals"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
              >
                Explore role-based portals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-primary-100 bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming launch timeline</h3>
              <ul className="mt-6 space-y-4 text-sm text-gray-600">
                <li>
                  <span className="font-semibold text-primary-600">Q1 2025</span> — Agent CRM, Inventory Management, and AI Outreach Assistant launch.
                </li>
                <li>
                  <span className="font-semibold text-primary-600">Q2 2025</span> — Developer 3D model pipeline & Marketing monetization suite.
                </li>
                <li>
                  <span className="font-semibold text-primary-600">Q3 2025</span> — Lawyer & Surveyor verification console; secure document vault.
                </li>
                <li>
                  <span className="font-semibold text-primary-600">Q4 2025</span> — Mortgage advisor portal, escrow integrations, and blockchain deeds.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-bold">Ready to bring your inventory to the region&apos;s smartest marketplace?</h2>
              <p className="text-sm text-white/80">
                Join hundreds of real estate professionals using Property Nexus to orchestrate launches, automate workflows, and delight clients.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portals"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50"
              >
                Launch my portal
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

