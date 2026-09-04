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
  mediaMeta?: { src: string; label: string }[];
  enableWalkthrough?: boolean;
};

const DEFAULT_LABELS = ['Exterior', 'Living room', 'Kitchen', 'Bedroom', 'Aerial', 'Night view'];

function toGallery(images: string[], mediaMeta?: { src: string; label: string }[]): GalleryImage[] {
  if (mediaMeta?.length) return mediaMeta.map((m) => ({ src: m.src, label: m.label }));
  return images.map((src, i) => ({ src, label: DEFAULT_LABELS[i] || `Photo ${i + 1}` }));
}

/** 2D floor-plan hotspot positions (percent of plan area). */
const WALKTHROUGH_HOTSPOTS: Record<string, { x: number; y: number }> = {
  pool: { x: 72, y: 78 },
  living: { x: 28, y: 68 },
  kitchen: { x: 55, y: 68 },
  bedroom: { x: 38, y: 28 },
  aerial: { x: 78, y: 22 },
  night: { x: 18, y: 40 },
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
        key.includes('pool') || key.includes('exterior')
          ? 'pool'
          : key.includes('living')
            ? 'living'
            : key.includes('kitchen')
              ? 'kitchen'
              : key.includes('bed')
                ? 'bedroom'
                : key.includes('aerial')
                  ? 'aerial'
                  : key.includes('night')
                    ? 'night'
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
    <div>
      {enableWalkthrough && (
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('photos')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              tab === 'photos' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" /> Photos
          </button>
          <button
            type="button"
            onClick={() => setTab('walkthrough')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              tab === 'walkthrough' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <View className="h-3.5 w-3.5" /> 3D walkthrough
          </button>
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
