import { notFound } from 'next/navigation';
import { mockAgents } from '@/data/mockData';

interface AgentProfilePageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return mockAgents.map((agent) => ({ id: agent.id }));
}

export default function AgentProfilePage({ params }: AgentProfilePageProps) {
  const agent = mockAgents.find((item) => item.id === params.id);

  if (!agent) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6">
        <img src={agent.avatar} alt={agent.name} className="h-24 w-24 rounded-full object-cover" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
          <p className="text-sm text-gray-600">{agent.specialization}</p>
        </div>
      </div>
      <p className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        This is a placeholder profile page. Populate with performance analytics, client reviews, active listings, and onboarding steps.
      </p>
    </div>
  );
}
