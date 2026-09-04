'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'agent'>('user');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', territory: 'Dubai' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register({ ...form, role });
      router.push(user.role === 'user' ? '/properties' : '/agent');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-2 text-sm text-gray-600">Join as a buyer or as a property dealer.</p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${role === 'user' ? 'bg-white text-primary-700 shadow' : 'text-gray-600'}`}
          >
            End user
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${role === 'agent' ? 'bg-white text-primary-700 shadow' : 'text-gray-600'}`}
          >
            Dealer / agent
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {(['name', 'email', 'phone', 'territory', 'password'] as const).map((field) => (
            <div key={field}>
              <label className="text-sm font-semibold capitalize text-gray-700" htmlFor={field}>{field}</label>
              <input
                id={field}
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                required={field === 'name' || field === 'email' || field === 'password'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered? <Link className="font-semibold text-primary-600" href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
