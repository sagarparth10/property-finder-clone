import { Metadata } from 'next';
import { AIChatPanel } from '@/components/Chatbot/AIChatPanel';
import { PlugZap, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Concierge | Property Nexus',
  description: 'Chat with the Property Nexus AI concierge about listings, neighborhoods, and financing.',
};

export default function AIAssistantPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <AIChatPanel />
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">What you can ask</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• Property shortlists (budget, location, amenities)</li>
              <li>• Investment metrics and neighborhood comparisons</li>
              <li>• Legal and financing workflows in the UAE</li>
              <li>• How to use the agent, developer, or lawyer portals</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <PlugZap className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Next steps</h3>
            <p className="mt-2 text-sm text-gray-600">
              Replace the placeholder backend prompt and connect the chat history to property search, analytics, and CRM workflows to deliver contextual answers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
