import Link from 'next/link';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: 'Discover',
    links: [
      { label: 'Properties', href: '/properties' },
      { label: 'Agents & Brokers', href: '/agents' },
      { label: 'Neighborhoods', href: '/insights' },
      { label: 'AI Assistant', href: '/ai-assistant' },
    ],
  },
  {
    title: 'Portals',
    links: [
      { label: 'Agent Portal', href: '/agent' },
      { label: 'Developer Portal', href: '/portals#developers' },
      { label: 'Lawyer Portal', href: '/portals#lawyers' },
      { label: 'Mortgage Advisors', href: '/portals#mortgage' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                <Building2 className="h-5 w-5" />
              </span>
              Property Nexus
            </Link>
            <p className="text-sm text-gray-600">
              A unified real estate platform connecting buyers, agents, developers, and legal experts with AI-powered insights.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-600" /> +971 800 123 456
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-600" /> hello@propertynexus.ai
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" /> Dubai Design District, UAE
              </span>
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link className="transition hover:text-primary-600" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Property Nexus. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="transition hover:text-primary-600" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="transition hover:text-primary-600" href="/terms">
              Terms of Service
            </Link>
            <Link className="transition hover:text-primary-600" href="/legal">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
