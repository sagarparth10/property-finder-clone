'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { propertyAPI } from '@/utils/api';

const EMPTY = {
  title: '',
  description: '',
  type: 'sale' as 'sale' | 'rent',
  price: '',
  location: 'Dubai Marina, Dubai',
  bedrooms: '2',
  bathrooms: '2',
  area: '1200',
  furnished: false,
  images: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  amenities: 'Gym, Pool, Parking',
};

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        price: Number(form.price),
        location: form.location,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area: Number(form.area),
        furnished: form.furnished,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const data = await propertyAPI.create(payload);
      setResult(data);
      setTimeout(() => router.push('/agent/matches'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not publish listing');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add listing</h1>
      <p className="mt-1 text-sm text-gray-600">
        Publishing a listing runs CRM matching: existing buyer leads are scored, a demand ticket is opened, and auto-suggestions appear for dealers.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 md:grid-cols-2">
        <label className="md:col-span-2 text-sm font-semibold text-gray-700">
          Title
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'sale' | 'rent' })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal">
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Price (AED)
          <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="md:col-span-2 text-sm font-semibold text-gray-700">
          Location
          <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Bedrooms
          <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Bathrooms
          <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Area (sqft)
          <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" checked={form.furnished} onChange={(e) => setForm({ ...form, furnished: e.target.checked })} />
          Furnished
        </label>
        <label className="md:col-span-2 text-sm font-semibold text-gray-700">
          Description
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="md:col-span-2 text-sm font-semibold text-gray-700">
          Image URLs (comma separated)
          <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        <label className="md:col-span-2 text-sm font-semibold text-gray-700">
          Amenities (comma separated)
          <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-normal" />
        </label>
        {error && <p className="md:col-span-2 text-sm text-red-600">{typeof error === 'string' ? error : 'Validation failed'}</p>}
        {result && (
          <p className="md:col-span-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            Live. Matched {result.matching?.matched ?? 0} buyer leads and opened a demand ticket. Opening matches…
          </p>
        )}
        <div className="md:col-span-2">
          <button type="submit" disabled={busy} className="rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
            {busy ? 'Publishing…' : 'Publish listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
