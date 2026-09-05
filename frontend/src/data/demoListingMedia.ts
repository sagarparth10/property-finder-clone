/** Shared demo media for featured API + mock listings. */

export type DemoMediaItem = { src: string; thumbSrc?: string; label: string };

export const VILLA_DEMO_API_ID = 'e76b5ab7-b3d0-43a2-ba28-11b4bb5dfd89';
export const PENTHOUSE_DEMO_API_ID = '5f61ffff-d7e5-445b-80f6-c711f2875be9';

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

/** High-rise penthouse gallery — never reuse villa+pool Unsplash assets. */
export const PENTHOUSE_DEMO_MEDIA_META: DemoMediaItem[] = [
  { src: '/media/penthouse-skyline.webp', thumbSrc: '/media/penthouse-skyline-thumb.webp', label: 'Skyline' },
  { src: '/media/penthouse-living-room.webp', thumbSrc: '/media/penthouse-living-room-thumb.webp', label: 'Living room' },
  { src: '/media/penthouse-kitchen.webp', thumbSrc: '/media/penthouse-kitchen-thumb.webp', label: 'Kitchen' },
  { src: '/media/penthouse-bedroom.webp', thumbSrc: '/media/penthouse-bedroom-thumb.webp', label: 'Bedroom' },
  { src: '/media/penthouse-terrace.webp', thumbSrc: '/media/penthouse-terrace-thumb.webp', label: 'Terrace' },
  { src: '/media/penthouse-dining.webp', thumbSrc: '/media/penthouse-dining-thumb.webp', label: 'Dining' },
];

/** @deprecated Use PENTHOUSE_DEMO_MEDIA_META */
export const PALM_DEMO_MEDIA_META = PENTHOUSE_DEMO_MEDIA_META;

export type DemoGalleryKey = 'villa' | 'marina' | 'downtown' | 'penthouse';

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
  penthouse: {
    images: PENTHOUSE_DEMO_MEDIA_META.map((m) => m.src),
    mediaMeta: PENTHOUSE_DEMO_MEDIA_META,
    walkthrough: true,
    mockIds: ['4', PENTHOUSE_DEMO_API_ID],
  },
};

function norm(value: unknown): string {
  return String(value || '').toLowerCase();
}

function isPalmOrPenthouseText(title: string, location: string): boolean {
  return (
    title.includes('palm') ||
    title.includes('penthouse') ||
    location.includes('palm') ||
    location.includes('penthouse')
  );
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

  // Penthouse before villa: Palm Jumeirah contains "Jumeirah"; never let villa win.
  if (
    images.some((src) => src.includes('/media/penthouse-') || src.includes('/media/palm-')) ||
    title.includes('premium 4br penthouse') ||
    ((location.includes('palm') || title.includes('palm')) &&
      (title.includes('penthouse') || title.includes('4br') || title.includes('4 br')))
  ) {
    return 'penthouse';
  }

  // Villa: UUID (mockIds above), exact demo title, or existing villa media paths.
  // Never match on bare "Jumeirah" — Palm Jumeirah contains that substring.
  if (
    !isPalmOrPenthouseText(title, location) &&
    (title === 'spacious 3br villa in jumeirah' ||
      images.some((src) => src.includes('/media/villa-')))
  ) {
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
  penthouse: PENTHOUSE_DEMO_MEDIA_META.map((m) => m.src),
};
