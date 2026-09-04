'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { href: '/agent', label: 'Dashboard' },
  { href: '/agent/listings', label: 'My listings' },
  { href: '/agent/listings/new', label: 'Add listing' },
  { href: '/agent/leads', label: 'Leads' },
  { href: '/agent/matches', label: 'Auto-matches' },
];

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { user, loading, isDealer } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/agent');
      return;
    }
    if (!isDealer) router.replace('/properties');
  }, [loading, user, isDealer, router]);

  if (loading || !isDealer) {
    return <div className="px-6 py-16 text-center text-sm text-gray-500">Opening dealer workspace…</div>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <aside className="w-full shrink-0 lg:w-56">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Dealer portal</p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">{user?.name}</h2>
        <p className="text-xs capitalize text-gray-500">{user?.role} · {user?.territory || 'UAE'}</p>
        <nav className="mt-6 space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                  active ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
