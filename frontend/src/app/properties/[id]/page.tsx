'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bed, Bath, Square, MapPin, ShieldCheck } from 'lucide-react';
import { propertyAPI } from '@/utils/api';
import { formatAed } from '@/utils/listings';
import { useAuth } from '@/context/AuthContext';

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: 'I would like a viewing.',
    budget: '',
  });

  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || '').split(' ');
      setForm((f) => ({ ...f, firstName: first, lastName: rest.join(' '), email: user.email, phone: user.phone || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!params.id) return;
    propertyAPI
      .getById(params.id)
      .then(setProperty)
      .catch(() => setError('Listing not found'));
  }, [params.id]);

  const onInquire = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await propertyAPI.inquire(params.id, {
        ...form,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send inquiry');
    }
  };

  if (error && !property) return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-red-600">{error}</div>;
  if (!property) return <div className="px-4 py-16 text-center text-sm text-gray-500">Loading listing…</div>;

  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={property.title} className="h-80 w-full object-cover" />
          </div>
          <div className="mt-6 flex items-center gap-3">
            {property.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase text-primary-700">{property.type}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{property.title}</h1>
          <p className="mt-2 flex items-center text-sm text-gray-600">
            <MapPin className="mr-1 h-4 w-4" /> {property.location}
          </p>
          <p className="mt-4 text-3xl font-bold text-primary-700">
            {formatAed(property.price)}
            {property.type === 'rent' && <span className="text-base font-normal text-gray-500"> / year</span>}
          </p>
          <div className="mt-6 flex gap-6 text-gray-700">
            <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms} bed</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} bath</span>
            <span className="flex items-center gap-1"><Square className="h-4 w-4" /> {property.area} sqft</span>
          </div>
          <p className="mt-6 text-sm leading-6 text-gray-700">{property.description}</p>
          {property.amenities?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {property.amenities.map((item: string) => (
                <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{item}</span>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <form onSubmit={onInquire} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Inquire with the dealer</h2>
            <p className="mt-1 text-sm text-gray-600">Creates a CRM lead and auto-suggests similar listings to the assigned agent.</p>
            {sent ? (
              <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                Inquiry sent. A dealer will follow up, and matching inventory is already queued in their workspace.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <input type="number" placeholder="Budget (AED)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm" rows={3} />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button type="submit" className="w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700">
                  Send inquiry
                </button>
              </div>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
}
