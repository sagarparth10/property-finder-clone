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
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <BoxSelect className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">3D walkthrough</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
          <Sparkles className="h-3 w-3" /> Demo · AI visualization
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative min-h-[260px] overflow-hidden bg-gradient-to-br from-sky-100 via-stone-100 to-stone-200 lg:min-h-[340px]">
          {/* Stylized villa plan backdrop */}
          <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/70 bg-white/40 shadow-inner backdrop-blur-[1px]">
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
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                style={{ left: `${stop.hotspot.x}%`, top: `${stop.hotspot.y}%` }}
              >
                <span
                  className={`relative flex h-4 w-4 items-center justify-center rounded-full transition ${
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
                  className={`mt-1 block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
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

        <div className="flex flex-col">
          <div className="relative flex-1 overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.id}
              src={active.src}
              alt={active.label}
              className="h-56 w-full object-cover transition-opacity duration-300 sm:h-64 lg:h-full lg:min-h-[340px]"
            />
            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {active.label}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-gray-100 p-3">
            {stops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setActiveId(stop.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
