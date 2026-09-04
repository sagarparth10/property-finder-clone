'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard/ListingCard';
import { mockProperties } from '@/data/mockData';
import { propertyAPI } from '@/utils/api';
import { toListingCard } from '@/utils/listings';
import { Filter, MapPinned } from 'lucide-react';

const PROPERTY_TYPES = ['All', 'sale', 'rent'];
const PRICE_BRACKETS = ['< AED 100K', 'AED 100K - 500K', 'AED 500K - 1M', 'AED 1M+'];

export default function PropertiesPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('');
  const [listings, setListings] = useState<any[]>(mockProperties);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    propertyAPI
      .getAll({ limit: 50 })
      .then((data) => {
        const items = data.items || data;
        if (Array.isArray(items) && items.length) {
          setListings(items.map(toListingCard));
          setFromApi(true);
        }
      })
      .catch(() => undefined);
  }, []);

  const filteredProperties = listings.filter((property) => {
    const matchesType = typeFilter === 'All' || property.type === typeFilter;
    const matchesPrice =
      !priceFilter ||
      (priceFilter === '< AED 100K' && property.price < 100000) ||
      (priceFilter === 'AED 100K - 500K' && property.price >= 100000 && property.price <= 500000) ||
      (priceFilter === 'AED 500K - 1M' && property.price > 500000 && property.price <= 1000000) ||
      (priceFilter === 'AED 1M+' && property.price > 1000000);
    return matchesType && matchesPrice;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Find your next property</h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Live dealer inventory{fromApi ? ' from the marketplace API' : ' (demo catalog)'}. Inquire to create a lead the matching engine can assign.
          </p>
        </div>
        <Link
          href="/login?next=/agent"
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <Filter className="h-4 w-4" /> Dealer workspace
        </Link>
      </div>

      <div className="mt-8 grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-4">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Listing type</h2>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Budget</h2>
          <div className="flex flex-wrap gap-2">
            {PRICE_BRACKETS.map((range) => (
              <button
                key={range}
                onClick={() => setPriceFilter(range === priceFilter ? '' : range)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  priceFilter === range
                    ? 'bg-primary-100 text-primary-700 shadow-inner'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-2xl bg-primary-50 p-4 text-sm text-primary-700">
          <p className="font-semibold uppercase tracking-wide">Need expert help?</p>
          <p>Match with a verified dealer specialised in your community.</p>
          <Link className="inline-flex items-center gap-1 text-sm font-semibold" href="/agents">
            View agents <MapPinned className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.length ? (
          filteredProperties.map((property) => (
            <ListingCard key={property.id} property={property} />
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">No listings match your filters yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
