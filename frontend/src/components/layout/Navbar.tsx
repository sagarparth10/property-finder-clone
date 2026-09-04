'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/agents', label: 'Agents' },
  { href: '/ai-assistant', label: 'AI Agent' },
  { href: '/portals', label: 'Portals' },
  { href: '/insights', label: 'Insights' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isDealer, logout } = useAuth();

  const isActive = (href: string) => (pathname === href ? 'text-primary-600' : 'text-gray-600');
  const dealerCta = isDealer ? '/agent/listings/new' : user ? '/login?next=/agent' : '/login?next=/agent';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          Property Nexus
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-primary-600 ${isActive(link.href)}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isDealer && (
                <Link href="/agent" className="text-sm font-semibold text-gray-700 hover:text-primary-600">
                  Dealer workspace
                </Link>
              )}
              <span className="text-sm text-gray-500">{user.name.split(' ')[0]}</span>
              <button type="button" onClick={logout} className="text-sm font-semibold text-gray-700 hover:text-primary-600">
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-gray-700 transition hover:text-primary-600">
              Log in
            </Link>
          )}
          <Link
            href={dealerCta}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            {isDealer ? 'Add listing' : 'Dealer login'}
          </Link>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 flex items-center gap-3">
              {user ? (
                <button
                  type="button"
                  className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
              )}
              <Link
                href={dealerCta}
                className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                onClick={() => setMobileOpen(false)}
              >
                {isDealer ? 'Add listing' : 'Dealer login'}
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
