import { Metadata } from 'next';
import { Suspense } from 'react';
import { AIAssistantContent } from '@/components/Chatbot/AIAssistantContent';

export const metadata: Metadata = {
  title: 'AI Concierge | Property Nexus',
  description: 'Chat with the Property Nexus AI concierge about listings, neighborhoods, and financing.',
};

export default function AIAssistantPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center rounded-3xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm">
            Loading concierge…
          </div>
        }
      >
        <AIAssistantContent />
      </Suspense>
    </div>
  );
}
