/** Shared demo media for featured API + mock listings. */

export type DemoMediaItem = { src: string; thumbSrc?: string; label: string };

export const VILLA_DEMO_API_ID = 'e76b5ab7-b3d0-43a2-ba28-11b4bb5dfd89';

export const VILLA_DEMO_MEDIA_META: DemoMediaItem[] = [
  {
    src: '/media/villa-pool-exterior.webp',
    thumbSrc: '/media/villa-pool-exterior-thumb.webp',
    label: 'Pool exterior',
  },
  {
    src: '/media/villa-living-room.webp',
    thumbSrc: '/media/villa-living-room-thumb.webp',
    label: 'Living room',
  },
  {
    src: '/media/villa-kitchen.webp',
    thumbSrc: '/media/villa-kitchen-thumb.webp',
    label: 'Kitchen',
  },
  {
    src: '/media/villa-bedroom.webp',
    thumbSrc: '/media/villa-bedroom-thumb.webp',
    label: 'Bedroom',
  },
  {
    src: '/media/villa-aerial.webp',
    thumbSrc: '/media/villa-aerial-thumb.webp',
    label: 'Aerial',
  },
  {
    src: '/media/villa-night-exterior.webp',
    thumbSrc: '/media/villa-night-exterior-thumb.webp',
    label: 'Night exterior',
  },
];

export const VILLA_DEMO_IMAGES = VILLA_DEMO_MEDIA_META.map((m) => m.src);

export const MARINA_DEMO_MEDIA_META: DemoMediaItem[] = [
  { src: '/media/marina-exterior.webp', thumbSrc: '/media/marina-exterior-thumb.webp', label: 'Exterior' },
  { src: '/media/marina-living-room.webp', thumbSrc: '/media/marina-living-room-thumb.webp', label: 'Living room' },
  { src: '/media/marina-kitchen.webp', thumbSrc: '/media/marina-kitchen-thumb.webp', label: 'Kitchen' },
  { src: '/media/marina-bedroom.webp', thumbSrc: '/media/marina-bedroom-thumb.webp', label: 'Bedroom' },
  { src: '/media/marina-bathroom.webp', thumbSrc: '/media/marina-bathroom-thumb.webp', label: 'Bathroom' },
  { src: '/media/marina-balcony.webp', thumbSrc: '/media/marina-balcony-thumb.webp', label: 'Balcony' },
];

export const DOWNTOWN_DEMO_MEDIA_META: DemoMediaItem[] = [
  { src: '/media/downtown-living-room.webp', thumbSrc: '/media/downtown-living-room-thumb.webp', label: 'Living room' },
  { src: '/media/downtown-kitchen.webp', thumbSrc: '/media/downtown-kitchen-thumb.webp', label: 'Kitchen' },
  { src: '/media/downtown-bedroom.webp', thumbSrc: '/media/downtown-bedroom-thumb.webp', label: 'Bedroom' },
  { src: '/media/downtown-bathroom.webp', thumbSrc: '/media/downtown-bathroom-thumb.webp', label: 'Bathroom' },
  { src: '/media/downtown-workspace.webp', thumbSrc: '/media/downtown-workspace-thumb.webp', label: 'Workspace' },
  { src: '/media/downtown-exterior.webp', thumbSrc: '/media/downtown-exterior-thumb.webp', label: 'Exterior' },
];

export const PALM_DEMO_MEDIA_META: DemoMediaItem[] = [
  { src: '/media/palm-terrace.webp', thumbSrc: '/media/palm-terrace-thumb.webp', label: 'Terrace' },
  { src: '/media/palm-living-room.webp', thumbSrc: '/media/palm-living-room-thumb.webp', label: 'Living room' },
  { src: '/media/palm-kitchen.webp', thumbSrc: '/media/palm-kitchen-thumb.webp', label: 'Kitchen' },
  { src: '/media/palm-bedroom.webp', thumbSrc: '/media/palm-bedroom-thumb.webp', label: 'Bedroom' },
  { src: '/media/palm-pool.webp', thumbSrc: '/media/palm-pool-thumb.webp', label: 'Pool' },
  { src: '/media/palm-dining.webp', thumbSrc: '/media/palm-dining-thumb.webp', label: 'Dining' },
];

export type DemoGalleryKey = 'villa' | 'marina' | 'downtown' | 'palm';

const GALLERIES: Record<
  DemoGalleryKey,
  { images: string[]; mediaMeta: DemoMediaItem[]; walkthrough: boolean; mockIds: string[] }
> = {
  villa: {
    images: VILLA_DEMO_IMAGES,
    mediaMeta: VILLA_DEMO_MEDIA_META,
    walkthrough: true,
    mockIds: ['2', VILLA_DEMO_API_ID],
  },
  marina: {
    images: MARINA_DEMO_MEDIA_META.map((m) => m.src),
    mediaMeta: MARINA_DEMO_MEDIA_META,
    walkthrough: true,
    mockIds: ['1'],
  },
  downtown: {
    images: DOWNTOWN_DEMO_MEDIA_META.map((m) => m.src),
    mediaMeta: DOWNTOWN_DEMO_MEDIA_META,
    walkthrough: true,
    mockIds: ['3'],
  },
  palm: {
    images: PALM_DEMO_MEDIA_META.map((m) => m.src),
    mediaMeta: PALM_DEMO_MEDIA_META,
    walkthrough: true,
    mockIds: ['4'],
  },
};

function norm(value: unknown): string {
  return String(value || '').toLowerCase();
}

/** Match a demo listing to its curated gallery (strict — never reuse villa for palm/marina). */
export function resolveDemoGalleryKey(property: any, propertyId?: string | null): DemoGalleryKey | null {
  const id = String(property?.id || property?._id || propertyId || '');
  for (const [key, gallery] of Object.entries(GALLERIES) as [DemoGalleryKey, (typeof GALLERIES)[DemoGalleryKey]][]) {
    if (gallery.mockIds.includes(id)) return key;
  }

  const title = norm(property?.title);
  const location = norm(property?.location);
  const images: string[] = Array.isArray(property?.images) ? property.images.map(String) : [];

  if (images.some((src) => src.includes('/media/villa-')) || (location.includes('jumeirah') && title.includes('villa'))) {
    return 'villa';
  }
  if (
    images.some((src) => src.includes('/media/marina-')) ||
    (location.includes('marina') && (title.includes('2br') || title.includes('2 br') || title.includes('apartment')))
  ) {
    return 'marina';
  }
  if (
    images.some((src) => src.includes('/media/downtown-')) ||
    (location.includes('downtown') && (title.includes('studio') || title.includes('1br') || title.includes('1 br')))
  ) {
    return 'downtown';
  }
  if (
    images.some((src) => src.includes('/media/palm-')) ||
    ((location.includes('palm') || title.includes('palm')) && (title.includes('penthouse') || title.includes('4br') || title.includes('4 br')))
  ) {
    return 'palm';
  }

  return null;
}

export function isVillaDemoListing(property: any, propertyId?: string | null): boolean {
  return resolveDemoGalleryKey(property, propertyId) === 'villa';
}

export function withVillaDemoMedia<T extends Record<string, any>>(property: T): T {
  return withDemoListingMedia(property, 'villa');
}

export function withDemoListingMedia<T extends Record<string, any>>(
  property: T,
  forcedKey?: DemoGalleryKey | null,
  propertyId?: string | null,
): T {
  const key = forcedKey ?? resolveDemoGalleryKey(property, propertyId);
  if (!key) return property;
  const gallery = GALLERIES[key];
  return {
    ...property,
    images: [...gallery.images],
    mediaMeta: gallery.mediaMeta.map((m) => ({ ...m })),
    walkthrough: gallery.walkthrough,
    image: gallery.images[0],
  };
}

export function demoHeroImage(property: any, propertyId?: string | null): string | null {
  const key = resolveDemoGalleryKey(property, propertyId);
  return key ? GALLERIES[key].images[0] : null;
}

/** Image path lists for Worker/API seed + enrichment (no thumbs — DB stores src only). */
export const DEMO_LISTING_IMAGE_PATHS: Record<DemoGalleryKey, string[]> = {
  villa: [...VILLA_DEMO_IMAGES],
  marina: MARINA_DEMO_MEDIA_META.map((m) => m.src),
  downtown: DOWNTOWN_DEMO_MEDIA_META.map((m) => m.src),
  palm: PALM_DEMO_MEDIA_META.map((m) => m.src),
};
