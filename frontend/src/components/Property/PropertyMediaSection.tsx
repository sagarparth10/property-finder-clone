'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Image as ImageIcon, View } from 'lucide-react';
import PropertyGallery, { type GalleryImage } from './PropertyGallery';
import type { WalkthroughStop } from './HouseWalkthrough';

const HouseWalkthrough = dynamic(() => import('./HouseWalkthrough'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Loading 3D walkthrough…
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

const WALKTHROUGH_POSITIONS: Record<string, [number, number, number]> = {
  pool: [0, 0.5, 2.4],
  living: [-1.2, 1.2, 0.2],
  kitchen: [1.6, 1.15, 0.1],
  bedroom: [0.5, 2.7, -0.4],
  aerial: [2.8, 3.2, 2.2],
  night: [-2.4, 1.4, 1.8],
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
        position: WALKTHROUGH_POSITIONS[id] || ([index * 0.6 - 1.5, 1.2, 1.5] as [number, number, number]),
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
