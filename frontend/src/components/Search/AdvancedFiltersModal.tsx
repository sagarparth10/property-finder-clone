'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react';

export type AdvancedFilterValues = {
  type: 'All' | 'sale' | 'rent';
  price: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  furnished: boolean;
  verified: boolean;
};

const EMPTY_FILTERS: AdvancedFilterValues = {
  type: 'All',
  price: '',
  bedrooms: '',
  bathrooms: '',
  location: '',
  furnished: false,
  verified: false,
};

const PRICE_BRACKETS = ['< AED 100K', 'AED 100K - 500K', 'AED 500K - 1M', 'AED 1M+'];
const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5+'];
const BATHROOM_OPTIONS = ['1', '2', '3', '4+'];

type AdvancedFiltersModalProps = {
  open: boolean;
  onClose: () => void;
  initialSearch?: string;
};

function buildPropertiesUrl(filters: AdvancedFilterValues, search: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('q', search.trim());
  if (filters.type !== 'All') params.set('type', filters.type);
  if (filters.price) params.set('price', filters.price);
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
  if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
  if (filters.location.trim()) params.set('location', filters.location.trim());
  if (filters.furnished) params.set('furnished', '1');
  if (filters.verified) params.set('verified', '1');
  const query = params.toString();
  return query ? `/properties/?${query}` : '/properties/';
}

export function AdvancedFiltersModal({ open, onClose, initialSearch = '' }: AdvancedFiltersModalProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<AdvancedFilterValues>(EMPTY_FILTERS);

  useEffect(() => {
    if (open) {
      setFilters(EMPTY_FILTERS);
    }
  }, [open]);

  const apply = () => {
    onClose();
    router.push(buildPropertiesUrl(filters, initialSearch));
  };

  const clear = () => setFilters(EMPTY_FILTERS);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Filter className="h-5 w-5 text-primary-600" />
                    Advanced Filters
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6 px-6 py-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Listing type</p>
                    <div className="flex flex-wrap gap-2">
                      {(['All', 'sale', 'rent'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, type }))}
                          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                            filters.type === type
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Budget</p>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_BRACKETS.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              price: prev.price === range ? '' : range,
                            }))
                          }
                          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                            filters.price === range
                              ? 'bg-primary-100 text-primary-700 shadow-inner'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bedrooms</p>
                      <div className="flex flex-wrap gap-2">
                        {BEDROOM_OPTIONS.map((beds) => (
                          <button
                            key={beds}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                bedrooms: prev.bedrooms === beds ? '' : beds,
                              }))
                            }
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                              filters.bedrooms === beds
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {beds}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bathrooms</p>
                      <div className="flex flex-wrap gap-2">
                        {BATHROOM_OPTIONS.map((baths) => (
                          <button
                            key={baths}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                bathrooms: prev.bathrooms === baths ? '' : baths,
                              }))
                            }
                            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                              filters.bathrooms === baths
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {baths}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="filter-location" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Location
                    </label>
                    <input
                      id="filter-location"
                      value={filters.location}
                      onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Dubai Marina, Jumeirah"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none ring-primary-500 focus:bg-white focus:ring-2"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.furnished}
                        onChange={(e) => setFilters((prev) => ({ ...prev, furnished: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      Furnished
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters((prev) => ({ ...prev, verified: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      Verified only
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                  <button
                    type="button"
                    onClick={clear}
                    className="text-sm font-semibold text-gray-600 transition hover:text-gray-900"
                  >
                    Clear all
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={apply}
                      className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                    >
                      Apply filters
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
