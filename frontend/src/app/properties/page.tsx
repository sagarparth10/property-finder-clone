'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard/ListingCard';
import { mockProperties } from '@/data/mockData';
import { propertyAPI } from '@/utils/api';
import { toListingCard } from '@/utils/listings';
import { Filter, MapPinned } from 'lucide-react';

const PROPERTY_TYPES = ['All', 'sale', 'rent'];
const PRICE_BRACKETS = ['< AED 100K', 'AED 100K - 500K', 'AED 500K - 1M', 'AED 1M+'];

function matchesBedrooms(propertyBeds: number, filter: string) {
  if (!filter) return true;
  if (filter === '5+') return propertyBeds >= 5;
  return propertyBeds === Number(filter);
}

function matchesBathrooms(propertyBaths: number, filter: string) {
  if (!filter) return true;
  if (filter === '4+') return propertyBaths >= 4;
  return propertyBaths === Number(filter);
}

function matchesPrice(price: number, priceFilter: string) {
  if (!priceFilter) return true;
  if (priceFilter === '< AED 100K') return price < 100000;
  if (priceFilter === 'AED 100K - 500K') return price >= 100000 && price <= 500000;
  if (priceFilter === 'AED 500K - 1M') return price > 500000 && price <= 1000000;
  if (priceFilter === 'AED 1M+') return price > 1000000;
  return true;
}

function PropertiesContent() {
  const params = useSearchParams();
  const [typeFilter, setTypeFilter] = useState(params.get('type') || 'All');
  const [priceFilter, setPriceFilter] = useState(params.get('price') || '');
  const [bedroomsFilter, setBedroomsFilter] = useState(params.get('bedrooms') || '');
  const [bathroomsFilter, setBathroomsFilter] = useState(params.get('bathrooms') || '');
  const [locationFilter, setLocationFilter] = useState(params.get('location') || params.get('q') || '');
  const [furnishedOnly, setFurnishedOnly] = useState(params.get('furnished') === '1');
  const [verifiedOnly, setVerifiedOnly] = useState(params.get('verified') === '1');
  const [listings, setListings] = useState<any[]>(mockProperties);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    setTypeFilter(params.get('type') || 'All');
    setPriceFilter(params.get('price') || '');
    setBedroomsFilter(params.get('bedrooms') || '');
    setBathroomsFilter(params.get('bathrooms') || '');
    setLocationFilter(params.get('location') || params.get('q') || '');
    setFurnishedOnly(params.get('furnished') === '1');
    setVerifiedOnly(params.get('verified') === '1');
  }, [params]);

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
    const matchesBudget = matchesPrice(property.price, priceFilter);
    const matchesBeds = matchesBedrooms(property.bedrooms ?? 0, bedroomsFilter);
    const matchesBaths = matchesBathrooms(property.bathrooms ?? 0, bathroomsFilter);
    const locationQuery = locationFilter.trim().toLowerCase();
    const matchesLocation =
      !locationQuery ||
      String(property.location || '').toLowerCase().includes(locationQuery) ||
      String(property.title || '').toLowerCase().includes(locationQuery);
    const matchesFurnished = !furnishedOnly || property.furnished;
    const matchesVerified = !verifiedOnly || property.verified;
    return (
      matchesType &&
      matchesBudget &&
      matchesBeds &&
      matchesBaths &&
      matchesLocation &&
      matchesFurnished &&
      matchesVerified
    );
  });

  const activeExtras = [bedroomsFilter && `${bedroomsFilter} bed`, bathroomsFilter && `${bathroomsFilter} bath`, furnishedOnly && 'Furnished', verifiedOnly && 'Verified']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Find your next property</h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Live dealer inventory{fromApi ? ' from the marketplace API' : ' (demo catalog)'}. Inquire to create a lead the matching engine can assign.
          </p>
          {(locationFilter || activeExtras) && (
            <p className="break-words text-sm font-medium text-primary-700">
              Active filters: {[locationFilter, activeExtras].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <Link
          href="/login?next=/agent"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
        >
          <Filter className="h-4 w-4" /> Dealer workspace
        </Link>
      </div>

      <div className="mt-6 grid gap-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6 md:grid-cols-4 md:gap-6">
        <div className="min-w-0 space-y-3 sm:space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Listing type</h2>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
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
        <div className="min-w-0 space-y-3 sm:space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Budget</h2>
          <div className="flex flex-wrap gap-2">
            {PRICE_BRACKETS.map((range) => (
              <button
                key={range}
                onClick={() => setPriceFilter(range === priceFilter ? '' : range)}
                className={`min-h-[40px] rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition sm:px-4 sm:text-xs ${
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

      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.length ? (
          filteredProperties.map((property) => (
            <ListingCard key={property.id} property={property} />
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-10">
            <h3 className="text-lg font-semibold text-gray-900">No listings match your filters yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-gray-500 sm:px-6 lg:px-8">
          Loading properties…
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
