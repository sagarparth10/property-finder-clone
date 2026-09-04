import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Property Nexus',
  description: 'Learn about the vision, team, and story behind Property Nexus.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">About Property Nexus</h1>
      <p className="mt-4 text-sm text-gray-600">
        Property Nexus began as a collaboration between real estate brokers, product engineers, and AI researchers who wanted to fix the fragmented experience of buying and selling homes in the region. We&apos;re building a unified ecosystem that connects stakeholders with verified data, immersive visualisation, and intelligent workflows.
      </p>
      <p className="mt-4 text-sm text-gray-600">
        Our HQ is based in Dubai Design District, with distributed product teams across UAE, KSA, and Europe. We partner with leading developers, banks, and legal firms to streamline everything from discovery to post-handover services.
      </p>
    </div>
  );
}
