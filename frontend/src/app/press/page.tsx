import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press | Property Nexus',
  description: 'Press releases, media coverage, and brand assets for Property Nexus.',
};

const PRESS_ITEMS = [
  {
    outlet: 'Arabian Business',
    headline: 'Property Nexus raises Series A to build AI-first real estate operating system',
    link: '#',
  },
  {
    outlet: 'Khaleej Times',
    headline: 'Dubai startup brings 3D digital twins to property hunters with web-based tours',
    link: '#',
  },
  {
    outlet: 'TechCrunch',
    headline: 'Property Nexus wants to make end-to-end transactions frictionless across MENA',
    link: '#',
  },
];

export default function PressPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Press & Media</h1>
      <p className="mt-4 text-sm text-gray-600">
        For media enquiries, contact <a className="text-primary-600" href="mailto:press@propertynexus.ai">press@propertynexus.ai</a>. Download the media kit, logos, and executive bios on request.
      </p>

      <div className="mt-8 space-y-4">
        {PRESS_ITEMS.map((item) => (
          <article key={item.outlet} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{item.outlet}</p>
            <h2 className="mt-2 text-lg font-semibold text-gray-900">{item.headline}</h2>
            <a className="mt-2 inline-block text-sm font-semibold text-primary-600" href={item.link}>
              Read article (placeholder)
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
