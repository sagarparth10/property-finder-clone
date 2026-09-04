import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Bed,
  Bath,
  Briefcase,
  CheckCircle2,
  Circle,
  Clock3,
  MapPin,
  MessageSquare,
  Square,
  Star,
  TrendingUp,
} from 'lucide-react';
import { mockAgents, mockProperties } from '@/data/mockData';

interface AgentProfilePageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return mockAgents.map((agent) => ({ id: agent.id }));
}

function formatPrice(price: number, type: string) {
  const formatted = new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(price);
  return type === 'rent' ? `${formatted}/year` : formatted;
}

function formatReviewDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AgentProfilePage({ params }: AgentProfilePageProps) {
  const agent = mockAgents.find((item) => item.id === params.id);

  if (!agent) {
    notFound();
  }

  const activeListings = mockProperties.filter((property) => property.agent.id === agent.id);
  const maxMonthlyDeals = Math.max(...agent.monthlyDeals.map((item) => item.deals), 1);
  const completedOnboarding = agent.onboarding.filter((step) => step.completed).length;

  const stats = [
    { label: 'Deals closed', value: String(agent.dealsClosed), icon: Briefcase },
    { label: 'Avg response', value: `${agent.responseTimeHours}h`, icon: Clock3 },
    { label: 'Avg rating', value: agent.rating.toFixed(1), icon: Star },
    { label: 'Listings sold YTD', value: String(agent.listingsSoldYtd), icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="h-24 w-24 rounded-full border-4 border-primary-100 object-cover"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              {agent.verified && (
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{agent.specialization}</p>
            <p className="mt-2 text-sm text-gray-500">
              {agent.experience} experience · {agent.languages.join(', ')}
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <MessageSquare className="h-4 w-4" /> Request intro
        </Link>
      </div>

      {/* Performance analytics */}
      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Performance analytics</h2>
          <p className="mt-1 text-sm text-gray-600">
            Snapshot of closed deals, responsiveness, and year-to-date sales activity.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-primary-600">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">{stat.label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Deals closed (last 6 months)</p>
              <p className="text-xs text-gray-500">
                Success rate {agent.successRate}% · AED {(agent.totalSales / 1_000_000).toFixed(0)}M+ lifetime volume
              </p>
            </div>
          </div>
          <div className="mt-6 flex h-36 items-end gap-2 sm:gap-3">
            {agent.monthlyDeals.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">{item.deals}</span>
                <div
                  className="w-full rounded-t-md bg-primary-500/90"
                  style={{ height: `${Math.max((item.deals / maxMonthlyDeals) * 100, 8)}%` }}
                  title={`${item.month}: ${item.deals} deals`}
                />
                <span className="text-[11px] font-medium text-gray-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client reviews */}
      <section className="mt-12">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Client reviews</h2>
          <p className="mt-1 text-sm text-gray-600">Recent feedback from buyers and sellers.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {agent.reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  <p className="text-xs text-gray-500">{formatReviewDate(review.date)}</p>
                </div>
                <div className="inline-flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${
                        index < review.rating ? 'fill-amber-500' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">&ldquo;{review.quote}&rdquo;</p>
            </article>
          ))}
        </div>
      </section>

      {/* Active listings */}
      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Active listings</h2>
            <p className="mt-1 text-sm text-gray-600">
              Properties currently marketed by {agent.name.split(' ')[0]}.
            </p>
          </div>
          <Link
            href="/properties"
            className="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
          >
            Browse all properties
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
            No active listings right now.{' '}
            <Link href="/properties" className="font-semibold text-primary-600 hover:text-primary-700">
              Explore the marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeListings.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}/`}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold capitalize text-primary-700">
                    {property.type}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-lg font-bold text-primary-600">
                    {formatPrice(property.price, property.type)}
                  </p>
                  <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-gray-900">
                    {property.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {property.location}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Square className="h-3.5 w-3.5" /> {property.area} sqft
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Onboarding steps */}
      <section className="mt-12">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Onboarding steps</h2>
          <p className="mt-1 text-sm text-gray-600">
            {completedOnboarding} of {agent.onboarding.length} checklist items complete.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${(completedOnboarding / agent.onboarding.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-3">
            {agent.onboarding.map((step) => (
              <li
                key={step.id}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3"
              >
                {step.completed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step.completed ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {step.completed ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
