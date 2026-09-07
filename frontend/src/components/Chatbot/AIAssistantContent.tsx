'use client';

import { useConciergeLang } from '@/components/Avatar/useConciergeLang';
import { AIChatPanel } from './AIChatPanel';

export function AIAssistantContent() {
  const { lang, setLang, copy, isRtl } = useConciergeLang();

  return <AIChatPanel lang={lang} copy={copy} isRtl={isRtl} onLangChange={setLang} />;
}
