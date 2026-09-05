/** Shared demo media for the Jumeirah villa (mock id `2` + seeded API listing). */
export const VILLA_DEMO_API_ID = 'e76b5ab7-b3d0-43a2-ba28-11b4bb5dfd89';

export const VILLA_DEMO_IMAGES = [
  '/media/villa-pool-exterior.webp',
  '/media/villa-living-room.webp',
  '/media/villa-kitchen.webp',
  '/media/villa-bedroom.webp',
  '/media/villa-aerial.webp',
  '/media/villa-night-exterior.webp',
] as const;

export const VILLA_DEMO_MEDIA_META: { src: string; thumbSrc?: string; label: string }[] = [
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

export function isVillaDemoListing(property: any, propertyId?: string | null): boolean {
  const id = String(property?.id || property?._id || propertyId || '');
  if (id === '2' || id === VILLA_DEMO_API_ID) return true;

  const title = String(property?.title || '').toLowerCase();
  const location = String(property?.location || '').toLowerCase();
  // Palm penthouse shares "Jumeirah" in location — never treat it as the villa demo.
  if (title.includes('penthouse') || title.includes('palm jumeirah') || location.startsWith('palm')) {
    return false;
  }
  if (
    location.includes('jumeirah') &&
    title.includes('villa') &&
    (title.includes('3br') || title.includes('3 br') || title.includes('infinity') || title.includes('spacious'))
  ) {
    return true;
  }

  const images: string[] = property?.images || [];
  if (images.some((src) => /villa-(pool-exterior|living-room)/.test(String(src)))) return true;
  return false;
}

export function withVillaDemoMedia<T extends Record<string, any>>(property: T): T {
  return {
    ...property,
    images: [...VILLA_DEMO_IMAGES],
    mediaMeta: VILLA_DEMO_MEDIA_META.map((m) => ({ ...m })),
    walkthrough: true,
    image: VILLA_DEMO_IMAGES[0],
  };
}
