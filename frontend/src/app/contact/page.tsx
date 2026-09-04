import { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Property Nexus',
  description: 'Connect with the Property Nexus team for demos, partnerships, and customer success.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-gray-900">Let&apos;s build the future of real estate together</h1>
          <p className="text-sm text-gray-600">
            Whether you&apos;re launching new developments, scaling your brokerage, or exploring enterprise integrations, our team is ready to collaborate.
          </p>

          <div className="grid gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary-600" /> +971 800 123 456
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary-600" /> partnerships@propertynexus.ai
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" /> Dubai Design District, Building 5, Level 6
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600" /> Sunday – Thursday, 9:00 AM – 6:00 PM GST
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Enterprise & Partnerships</p>
            <p className="mt-2 text-sm text-gray-600">
              Book a 45-minute discovery session to explore white-label solutions, API access, or proof-of-concept pilots.
            </p>
            <a
              href="mailto:enterprise@propertynexus.ai"
              className="mt-4 inline-flex items-center rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Schedule a workshop
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Tell us about your goals</h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill out the form and our concierge team will reach out within 24 hours.
          </p>

          <form className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Amira Al Futtaim"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                  Business email
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="amira@propertynexus.ai"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700" htmlFor="company">
                  Company
                </label>
                <input
                  id="company"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Nexus Realty"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700" htmlFor="interest">
                What are you interested in?
              </label>
              <select
                id="interest"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option>Agent & Broker Platform</option>
                <option>Developer Launch Suite</option>
                <option>Legal & Compliance</option>
                <option>Mortgage Partnerships</option>
                <option>Custom/Enterprise Solution</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700" htmlFor="message">
                Project details
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Share your goals, timelines, and current challenges..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              Submit enquiry (non-functional demo)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
