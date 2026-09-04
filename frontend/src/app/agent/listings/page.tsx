'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ListingCard } from '@/components/ListingCard/ListingCard';
import { propertyAPI } from '@/utils/api';
import { toListingCard } from '@/utils/listings';

export default function AgentListingsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    propertyAPI
      .getMine()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load listings'));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My listings</h1>
          <p className="mt-1 text-sm text-gray-600">Inventory you published. New listings generate matches against the lead pool.</p>
        </div>
        <Link href="/agent/listings/new" className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
          Add listing
        </Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <ListingCard key={item._id} property={toListingCard(item)} />
        ))}
        {!items.length && !error && (
          <p className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
            No listings yet. Publish one to start matching buyer demand.
          </p>
        )}
      </div>
    </div>
  );
}
