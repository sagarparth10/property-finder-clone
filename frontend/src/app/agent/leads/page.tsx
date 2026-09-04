'use client';

import { useEffect, useState } from 'react';
import { crmAPI } from '@/utils/api';
import { formatAed } from '@/utils/listings';

export default function AgentLeadsPage() {
  const [bucket, setBucket] = useState<'all' | 'pool' | 'mine'>('all');
  const [data, setData] = useState<any>(null);
  const [notice, setNotice] = useState('');

  const load = () => crmAPI.leads({ bucket }).then(setData);

  useEffect(() => {
    load().catch(() => setNotice('Could not load leads'));
  }, [bucket]);

  const claim = async (id: string) => {
    await crmAPI.claimLead(id);
    setNotice('Claimed. This ticket is now exclusive to you.');
    await load();
  };

  const convert = async (id: string) => {
    await crmAPI.convertLead(id);
    setNotice('Converted into an opportunity.');
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Lead board</h1>
      <p className="mt-1 text-sm text-gray-600">
        Central pool like a ticket queue. First claim wins. Peers do not see the same lead as theirs unless you transfer it.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs text-gray-500">Open pool</p>
          <p className="text-xl font-semibold">{data?.kpis?.poolCount ?? '—'}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs text-gray-500">Assigned to me</p>
          <p className="text-xl font-semibold">{data?.kpis?.mineCount ?? '—'}</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs text-gray-500">Pipeline potential</p>
          <p className="text-xl font-semibold">{formatAed(data?.kpis?.pipelineValue || 0)}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {(['all', 'pool', 'mine'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setBucket(item)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
              bucket === item ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {notice && <p className="mt-4 text-sm text-primary-700">{notice}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Intent</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(data?.leads || []).map((lead: any) => (
              <tr key={lead._id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{lead.intent || '—'}</td>
                <td className="px-4 py-3">{lead.locationPreference || lead.territory}</td>
                <td className="px-4 py-3">{formatAed(lead.estimatedAmount || 0)}</td>
                <td className="px-4 py-3 capitalize">{lead.status}</td>
                <td className="px-4 py-3 text-xs">{lead.ownerUserId === 'unassigned' ? 'Pool' : 'Assigned'}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {lead.ownerUserId === 'unassigned' && lead.status !== 'converted' && (
                    <button onClick={() => claim(lead._id)} className="text-xs font-semibold text-primary-600">Claim</button>
                  )}
                  {lead.status !== 'converted' && lead.status !== 'disqualified' && lead.ownerUserId !== 'unassigned' && (
                    <button onClick={() => convert(lead._id)} className="text-xs font-semibold text-gray-700">Convert</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
