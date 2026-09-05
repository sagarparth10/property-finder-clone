'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
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

const SWIPE_THRESHOLD_PX = 40;

export default function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

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

  // Keep the active thumbnail visible in the horizontal strip.
  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const thumb = strip.children[active] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

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

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (safeImages.length < 2) {
      touchStartX.current = null;
      return;
    }
    if (touchDeltaX.current <= -SWIPE_THRESHOLD_PX) go(1);
    else if (touchDeltaX.current >= SWIPE_THRESHOLD_PX) go(-1);
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div className="min-w-0 w-full max-w-full">
      <div
        className="relative aspect-[4/3] max-h-[min(52vh,20rem)] w-full overflow-hidden rounded-2xl bg-gray-100 sm:aspect-auto sm:h-80 sm:max-h-none sm:rounded-3xl lg:h-[28rem]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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
          className="absolute inset-0 h-full w-full max-w-full object-cover select-none"
          draggable={false}
        />
        <div className="absolute bottom-3 left-3 max-w-[55%] truncate rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {current.label}
        </div>
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white sm:left-3 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white sm:right-3 sm:h-9 sm:w-9"
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
        <div
          ref={thumbsRef}
          className="mt-3 -mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 touch-pan-x [scrollbar-width:thin]"
        >
          {safeImages.map((img, index) => (
            <button
              key={`${img.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-28 ${
                index === active ? 'ring-primary-600' : 'ring-transparent opacity-80 hover:opacity-100'
              }`}
              aria-label={`View ${img.label}`}
              aria-current={index === active ? 'true' : undefined}
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
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
