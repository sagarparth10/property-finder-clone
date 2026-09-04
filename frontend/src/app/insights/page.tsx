import { Metadata } from 'next';
import { mockPriceTrends, mockNeighborhoodInsights, mockMortgageOptions } from '@/data/mockData';
import { TrendingUp, PieChart, Landmark, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Insights & Analytics | Property Nexus',
  description: 'Market intelligence, rental yield forecasts, and neighborhood analytics for the UAE real estate market.',
};

const HIGHLIGHTS = [
  {
    icon: <TrendingUp className="h-5 w-5 text-primary-600" />,
    label: 'Dubai Marina',
    value: '+6.2% YoY',
    context: 'Average sale price growth driven by waterfront premium assets.',
  },
  {
    icon: <Activity className="h-5 w-5 text-primary-600" />,
    label: 'Occupancy Index',
    value: '93%',
    context: 'Downtown rentals stay resilient with strong corporate demand.',
  },
  {
    icon: <Landmark className="h-5 w-5 text-primary-600" />,
    label: 'Mortgage Approvals',
    value: '72 hrs',
    context: 'Average approval time across our banking partners.',
  },
];

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Market intelligence & predictive analytics</h1>
        <p className="text-sm text-gray-600">
          Property Nexus aggregates live listings, transaction data, and partner feeds to deliver actionable dashboards. Use these insights to price projects, brief investors, and guide clients.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div key={item.label} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
              {item.icon}
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="mt-2 text-sm text-gray-600">{item.context}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Price trend tracker</h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              <PieChart className="h-4 w-4" /> Dubai Marina
            </span>
          </div>
          <div className="mt-8 grid gap-3">
            {mockPriceTrends.map((trend) => (
              <div key={trend.month} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                <span>{trend.month}</span>
                <span className="text-primary-600">AED {trend.average.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            *Data aggregated from DLD public records, partner feeds, and on-platform transactions.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Neighborhood readiness index</h2>
          <dl className="mt-6 grid gap-3 text-sm text-gray-700">
            {Object.entries(mockNeighborhoodInsights).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <dt className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                <dd className="text-primary-600">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {mockMortgageOptions.map((option) => (
          <div key={option.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{option.bank}</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              {option.interestRate}% {option.type} ⎯ {option.duration}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Max Amount: AED {option.maxAmount.toLocaleString()} | Min Amount: AED {option.minAmount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
