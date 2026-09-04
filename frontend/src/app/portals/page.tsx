import { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardCheck, Gavel, Wallet, Compass, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Role-Based Portals | Property Nexus',
  description: 'Dedicated workspaces for every real estate stakeholder: agents, developers, lawyers, surveyors, and mortgage advisors.',
};

const PORTALS = [
  {
    id: 'agents',
    name: 'Agent & Broker Portal',
    icon: <Compass className="h-6 w-6 text-primary-600" />,
    summary: 'High-performance CRM with AI-driven lead scoring, omni-channel messaging, and transaction timelines.',
    capabilities: ['Lead routing & follow-up automations', 'Inventory management synced to MLS feeds', 'Client collaboration rooms', 'Video + virtual tour scheduler'],
    cta: 'Open dealer workspace',
  },
  {
    id: 'developers',
    name: 'Developer Launch Control',
    icon: <Layers className="h-6 w-6 text-primary-600" />,
    summary: 'Power digital launches with 3D model uploads, allocation workflows, and customer journey analytics.',
    capabilities: ['3D/AR asset library', 'Channel partner management', 'Unit allocation rules engine', 'Marketing automation'],
    cta: 'Plan a launch',
  },
  {
    id: 'lawyers',
    name: 'Lawyer Compliance Desk',
    icon: <Gavel className="h-6 w-6 text-primary-600" />,
    summary: 'Digitally verify ownership, manage contracts, and execute e-signatures in a secure compliance vault.',
    capabilities: ['Integrated KYC & AML checks', 'Smart contract templates', 'Escrow workflows', 'Audit-ready activity logs'],
    cta: 'Join the legal panel',
  },
  {
    id: 'mortgage',
    name: 'Mortgage Advisor Studio',
    icon: <Wallet className="h-6 w-6 text-primary-600" />,
    summary: 'Serve buyers with instant pre-approvals, product comparison, and lender analytics.',
    capabilities: ['Eligibility calculators', 'Automated document collection', 'Digital underwriting checklists', 'Lender marketplace'],
    cta: 'Partner with us',
  },
  {
    id: 'surveyors',
    name: 'Surveyor & Valuation Hub',
    icon: <ClipboardCheck className="h-6 w-6 text-primary-600" />,
    summary: 'Upload inspection data, floor plans, and AI-generated valuation models for review.',
    capabilities: ['On-site inspection app', 'LiDAR & drone upload support', 'Issue-tracking workflows', 'Digital twin sync'],
    cta: 'Get early access',
  },
];

export default function PortalsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Portals engineered for every stakeholder</h1>
        <p className="mt-3 text-sm text-gray-600">
          Property Nexus eliminates fragmented tools by providing orchestrated workflows for each partner in the real estate lifecycle.
          From prospecting and launches to legal completion and post-handover services, collaborate in real time with granular permissions and AI assistance.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {PORTALS.map((portal) => (
          <div key={portal.id} id={portal.id} className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
              {portal.icon}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{portal.name}</h2>
              <p className="mt-2 text-sm text-gray-600">{portal.summary}</p>
            </div>
            <div className="grid gap-3 text-sm text-gray-600">
              {portal.capabilities.map((item) => (
                <div key={item} className="rounded-2xl bg-gray-50 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
              <Link
                href={portal.id === 'agents' ? '/login?next=/agent' : `/contact?interest=${portal.id}`}
                className="rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                {portal.cta}
              </Link>
              <Link className="text-sm font-semibold text-primary-600" href={`/insights#${portal.id}`}>
                Explore roadmap →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-dashed border-primary-200 bg-primary-50/60 p-8 text-center">
        <h2 className="text-2xl font-semibold text-primary-700">Looking to build a custom enterprise portal?</h2>
        <p className="mt-2 text-sm text-primary-600">
          We offer bespoke integrations for government entities, proptech startups, and institutional investors seeking white-label experiences.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Schedule a strategy session
        </Link>
      </div>
    </div>
  );
}
