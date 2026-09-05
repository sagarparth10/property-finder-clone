'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Image as ImageIcon, View } from 'lucide-react';
import PropertyGallery, { type GalleryImage } from './PropertyGallery';
import type { WalkthroughStop } from './HouseWalkthrough';

const HouseWalkthrough = dynamic(() => import('./HouseWalkthrough'), {
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Loading walkthrough…
    </div>
  ),
});

type PropertyMediaSectionProps = {
  title: string;
  images: string[];
  mediaMeta?: { src: string; thumbSrc?: string; label: string }[];
  enableWalkthrough?: boolean;
};

/** Infer a room/view label from path or filename — never assume Exterior for unknown photos. */
function inferLabelFromSrc(src: string, index: number): string {
  const name = decodeURIComponent(String(src || '')).toLowerCase();
  const rules: [RegExp, string][] = [
    [/living/, 'Living room'],
    [/kitchen/, 'Kitchen'],
    [/bedroom|master-bed|\bbed\b/, 'Bedroom'],
    [/bath/, 'Bathroom'],
    [/dining/, 'Dining'],
    [/balcony|terrace/, 'Balcony'],
    [/workspace|office|study/, 'Workspace'],
    [/pool/, 'Pool'],
    [/aerial|drone/, 'Aerial'],
    [/night/, 'Night exterior'],
    [/exterior|facade|building|street/, 'Exterior'],
  ];
  for (const [re, label] of rules) {
    if (re.test(name)) return label;
  }
  return index === 0 ? 'Photo' : `Photo ${index + 1}`;
}

function toGallery(
  images: string[],
  mediaMeta?: { src: string; thumbSrc?: string; label: string }[]
): GalleryImage[] {
  if (mediaMeta?.length) {
    return mediaMeta.map((m) => ({
      src: m.src,
      thumbSrc: m.thumbSrc,
      label: m.label?.trim() || inferLabelFromSrc(m.src, 0),
    }));
  }
  return images.map((src, i) => ({ src, label: inferLabelFromSrc(src, i) }));
}

/** 2D floor-plan hotspot positions (percent of plan area). */
const WALKTHROUGH_HOTSPOTS: Record<string, { x: number; y: number }> = {
  pool: { x: 72, y: 78 },
  living: { x: 28, y: 68 },
  kitchen: { x: 55, y: 68 },
  bedroom: { x: 38, y: 28 },
  bathroom: { x: 62, y: 32 },
  balcony: { x: 82, y: 55 },
  dining: { x: 45, y: 55 },
  workspace: { x: 22, y: 35 },
  aerial: { x: 78, y: 22 },
  night: { x: 18, y: 40 },
  exterior: { x: 70, y: 75 },
};

export default function PropertyMediaSection({
  title,
  images,
  mediaMeta,
  enableWalkthrough = false,
}: PropertyMediaSectionProps) {
  const [tab, setTab] = useState<'photos' | 'walkthrough'>('photos');
  const gallery = useMemo(() => toGallery(images, mediaMeta), [images, mediaMeta]);

  const stops: WalkthroughStop[] = useMemo(() => {
    return gallery.slice(0, 6).map((item, index) => {
      const key = item.label.toLowerCase();
      const id =
        key.includes('pool')
          ? 'pool'
          : key.includes('living')
            ? 'living'
            : key.includes('kitchen')
              ? 'kitchen'
              : key.includes('bed')
                ? 'bedroom'
                : key.includes('bath')
                  ? 'bathroom'
                  : key.includes('balcony') || key.includes('terrace')
                    ? 'balcony'
                    : key.includes('dining')
                      ? 'dining'
                      : key.includes('workspace') || key.includes('office')
                        ? 'workspace'
                        : key.includes('aerial')
                          ? 'aerial'
                          : key.includes('night')
                            ? 'night'
                            : key.includes('exterior')
                              ? 'exterior'
                              : `stop-${index}`;
      return {
        id: `${id}-${index}`,
        label: item.label,
        src: item.src,
        hotspot: WALKTHROUGH_HOTSPOTS[id] || { x: 20 + index * 12, y: 45 + (index % 2) * 15 },
      };
    });
  }, [gallery]);

  return (
    <div className="min-w-0 w-full max-w-full">
      {enableWalkthrough && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => setTab('photos')}
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition sm:min-h-0 sm:justify-start sm:py-2 ${
                tab === 'photos' ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="h-4 w-4 shrink-0" /> Photos
            </button>
            <button
              type="button"
              onClick={() => setTab('walkthrough')}
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition sm:min-h-0 sm:justify-start sm:py-2 ${
                tab === 'walkthrough' ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <View className="h-4 w-4 shrink-0" />
              <span className="truncate">3D walkthrough</span>
            </button>
          </div>
          <span className="hidden text-xs text-gray-500 sm:inline">Switch tabs to tour rooms in 3D</span>
        </div>
      )}

      {tab === 'photos' || !enableWalkthrough ? (
        <PropertyGallery images={gallery} alt={title} />
      ) : (
        <HouseWalkthrough stops={stops} />
      )}
    </div>
  );
}
