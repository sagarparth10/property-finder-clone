'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type GalleryImage = {
  src: string;
  /** Optional smaller image for the thumbnail strip (avoids loading full-res 6×). */
  thumbSrc?: string;
  label: string;
};

type PropertyGalleryProps = {
  images: GalleryImage[];
  alt: string;
};

export default function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const safeImages =
    images.length > 0
      ? images
      : [
          {
            src: '/media/marina-exterior.webp',
            thumbSrc: '/media/marina-exterior-thumb.webp',
            label: 'Photo',
          },
        ];
  const current = safeImages[Math.min(active, safeImages.length - 1)];

  const go = (delta: number) => {
    setActive((i) => (i + delta + safeImages.length) % safeImages.length);
  };

  // Preload only the active hero (and adjacent for snappy arrows) — not all 6 full-res.
  useEffect(() => {
    const len = safeImages.length;
    if (len === 0) return;
    const toPreload = [
      safeImages[active]?.src,
      safeImages[(active + 1) % len]?.src,
      safeImages[(active - 1 + len) % len]?.src,
    ].filter(Boolean) as string[];

    const unique = [...new Set(toPreload)];
    const links: HTMLLinkElement[] = [];
    for (const href of unique) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => {
      links.forEach((l) => l.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preload from stable src list + active index
  }, [active, images]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.src}
          src={current.src}
          alt={`${alt} — ${current.label}`}
          width={1600}
          height={900}
          decoding="async"
          fetchPriority="high"
          loading="eager"
          className="h-64 w-full object-cover sm:h-80 lg:h-[28rem]"
        />
        <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {current.label}
        </div>
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur-sm">
              {active + 1} / {safeImages.length}
            </div>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((img, index) => (
            <button
              key={`${img.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-28 ${
                index === active ? 'ring-primary-600' : 'ring-transparent opacity-80 hover:opacity-100'
              }`}
              aria-label={`View ${img.label}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumbSrc || img.src}
                alt=""
                width={400}
                height={225}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
