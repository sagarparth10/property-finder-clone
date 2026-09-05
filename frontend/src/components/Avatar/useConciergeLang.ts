'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ConciergeLang,
  getConciergeCopy,
  isConciergeLang,
  readStoredConciergeLang,
  storeConciergeLang,
} from './conciergeI18n';

function resolveInitialLang(langParam: string | null): ConciergeLang {
  if (isConciergeLang(langParam)) return langParam;
  return readStoredConciergeLang() ?? 'en';
}

export function useConciergeLang() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');

  const [lang, setLangState] = useState<ConciergeLang>(() => resolveInitialLang(langParam));

  useEffect(() => {
    if (isConciergeLang(langParam)) {
      setLangState((prev) => (prev === langParam ? prev : langParam));
      storeConciergeLang(langParam);
      return;
    }

    const stored = readStoredConciergeLang();
    if (!stored) return;

    setLangState((prev) => (prev === stored ? prev : stored));
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : '',
    );
    if (params.get('lang') === stored) return;
    params.set('lang', stored);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [langParam, pathname, router]);

  const setLang = useCallback(
    (next: ConciergeLang) => {
      setLangState(next);
      storeConciergeLang(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set('lang', next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const copy = useMemo(() => getConciergeCopy(lang), [lang]);
  const isRtl = lang === 'ar';

  return { lang, setLang, copy, isRtl };
}
