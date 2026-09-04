'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '';
  const [email, setEmail] = useState('john.dealer@propertynexus.ai');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      const dealer = ['agent', 'broker', 'admin'].includes(user.role);
      router.push(next || (dealer ? '/agent' : '/properties'));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Log in</h1>
        <p className="mt-2 text-sm text-gray-600">
          Buyers browse and inquire. Dealers list inventory, claim leads, and get auto-matches.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold text-gray-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
          <p className="font-semibold text-gray-800">Demo accounts (password: Demo1234!)</p>
          <ul className="mt-2 space-y-1">
            <li>Dealer: john.dealer@propertynexus.ai</li>
            <li>Luxury dealer: sarah.dealer@propertynexus.ai</li>
            <li>Buyer: maya.buyer@propertynexus.ai</li>
            <li>Broker: amira.broker@propertynexus.ai</li>
          </ul>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          New here? <Link className="font-semibold text-primary-600" href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-gray-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
