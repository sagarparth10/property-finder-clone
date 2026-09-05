'use client';

import { ShieldCheck } from 'lucide-react';
import { useConciergeLang } from '@/components/Avatar/useConciergeLang';
import { AIChatPanel } from './AIChatPanel';

export function AIAssistantContent() {
  const { lang, setLang, copy, isRtl } = useConciergeLang();

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <AIChatPanel lang={lang} copy={copy} isRtl={isRtl} onLangChange={setLang} />
      </section>

      <aside>
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{copy.whatYouCanAskTitle}</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {copy.whatYouCanAsk.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
