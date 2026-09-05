'use client';

import { useMemo, useState } from 'react';
import { BoxSelect, Sparkles } from 'lucide-react';

export type WalkthroughStop = {
  id: string;
  label: string;
  src: string;
  /** Percentage coords on the 2D floor plan (0–100). */
  hotspot: { x: number; y: number };
};

type HouseWalkthroughProps = {
  stops: WalkthroughStop[];
};

export default function HouseWalkthrough({ stops }: HouseWalkthroughProps) {
  const [activeId, setActiveId] = useState(stops[0]?.id || '');
  const active = useMemo(
    () => stops.find((s) => s.id === activeId) || stops[0],
    [activeId, stops],
  );

  if (!active) return null;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white sm:rounded-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <BoxSelect className="h-4 w-4 shrink-0 text-primary-600" />
          <h3 className="truncate text-sm font-semibold text-gray-900">3D walkthrough</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
          <Sparkles className="h-3 w-3 shrink-0" /> Demo · AI visualization
        </span>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="relative min-h-[200px] overflow-hidden bg-gradient-to-br from-sky-100 via-stone-100 to-stone-200 sm:min-h-[260px] lg:min-h-[340px]">
          {/* Stylized villa plan backdrop */}
          <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-white/70 bg-white/40 shadow-inner backdrop-blur-[1px] sm:inset-6">
            <div className="absolute inset-x-[12%] top-[10%] h-[38%] rounded-lg border border-stone-300/80 bg-stone-50/70" />
            <div className="absolute bottom-[12%] left-[12%] right-[35%] h-[32%] rounded-lg border border-stone-300/80 bg-stone-50/60" />
            <div className="absolute bottom-[12%] right-[12%] h-[32%] w-[20%] rounded-lg border border-sky-300/70 bg-sky-100/50" />
            <div className="absolute left-[18%] top-[52%] h-px w-[45%] bg-stone-300/80" />
            <div className="absolute left-[48%] top-[22%] h-[28%] w-px bg-stone-300/80" />
          </div>

          {stops.map((stop) => {
            const isActive = stop.id === active.id;
            return (
              <button
                key={stop.id}
                type="button"
                onClick={() => setActiveId(stop.id)}
                aria-label={`View ${stop.label}`}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-manipulation focus:outline-none"
                style={{ left: `${stop.hotspot.x}%`, top: `${stop.hotspot.y}%` }}
              >
                <span
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full transition sm:h-4 sm:w-4 ${
                    isActive
                      ? 'bg-primary-600 ring-4 ring-primary-300/60'
                      : 'bg-white ring-2 ring-primary-500/70 hover:bg-primary-50'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary-400/50" />
                  )}
                </span>
                <span
                  className={`mt-1 hidden max-w-[5.5rem] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm sm:block ${
                    isActive ? 'bg-primary-600 text-white' : 'bg-white/95 text-gray-700'
                  }`}
                >
                  {stop.label}
                </span>
              </button>
            );
          })}

          <p className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-gray-600">
            Tap hotspots to tour rooms
          </p>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="relative max-h-[42vh] flex-1 overflow-hidden bg-gray-100 sm:max-h-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.id}
              src={active.src}
              alt={active.label}
              width={1600}
              height={900}
              loading="eager"
              decoding="async"
              className="h-48 w-full max-w-full object-cover transition-opacity duration-300 sm:h-64 lg:h-full lg:min-h-[340px]"
            />
            <div className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {active.label}
            </div>
          </div>
          <div className="-mx-0 flex gap-2 overflow-x-auto overscroll-x-contain border-t border-gray-100 p-3 touch-pan-x [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
            {stops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setActiveId(stop.id)}
                className={`min-h-[36px] shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  stop.id === active.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stop.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
