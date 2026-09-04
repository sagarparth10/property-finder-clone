import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Property Nexus',
  description: 'Join the Property Nexus team to build the future of real estate technology.',
};

const OPENINGS = [
  {
    title: 'Senior Product Designer',
    location: 'Dubai · Hybrid',
    description: 'Lead the design of immersive property browsing experiences and cross-portal workflows.',
  },
  {
    title: 'Full Stack Engineer (Next.js + NestJS)',
    location: 'Remote · GMT+4',
    description: 'Build role-based portals, GraphQL/REST endpoints, and AI-enhanced features.',
  },
  {
    title: 'Real Estate Partnerships Lead',
    location: 'Dubai · On-site',
    description: 'Grow our developer, brokerage, and banking partnerships across MENA.',
  },
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Careers at Property Nexus</h1>
      <p className="mt-4 text-sm text-gray-600">
        We&apos;re a multidisciplinary team of engineers, real estate experts, creatives, and data scientists. Help us invent a smarter, transparent, and more inclusive ecosystem for property transactions.
      </p>

      <div className="mt-8 space-y-4">
        {OPENINGS.map((role) => (
          <div key={role.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{role.title}</h2>
            <p className="mt-1 text-sm text-primary-600">{role.location}</p>
            <p className="mt-2 text-sm text-gray-600">{role.description}</p>
            <button className="mt-4 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
              Apply (placeholder)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
