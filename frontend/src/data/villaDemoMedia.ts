/** Shared demo media for the Jumeirah villa (mock id `2` + seeded API listing). */
export const VILLA_DEMO_API_ID = 'e76b5ab7-b3d0-43a2-ba28-11b4bb5dfd89';

export const VILLA_DEMO_IMAGES = [
  '/media/villa-pool-exterior.png',
  '/media/villa-living-room.png',
  '/media/villa-kitchen.png',
  '/media/villa-bedroom.png',
  '/media/villa-aerial.png',
  '/media/villa-night-exterior.png',
] as const;

export const VILLA_DEMO_MEDIA_META: { src: string; label: string }[] = [
  { src: '/media/villa-pool-exterior.png', label: 'Pool exterior' },
  { src: '/media/villa-living-room.png', label: 'Living room' },
  { src: '/media/villa-kitchen.png', label: 'Kitchen' },
  { src: '/media/villa-bedroom.png', label: 'Bedroom' },
  { src: '/media/villa-aerial.png', label: 'Aerial' },
  { src: '/media/villa-night-exterior.png', label: 'Night exterior' },
];

export function isVillaDemoListing(property: any, propertyId?: string | null): boolean {
  const id = String(property?.id || property?._id || propertyId || '');
  if (id === '2' || id === VILLA_DEMO_API_ID) return true;

  const title = String(property?.title || '').toLowerCase();
  const location = String(property?.location || '').toLowerCase();
  if (location.includes('jumeirah') && title.includes('villa') && (title.includes('3br') || title.includes('3 br') || title.includes('infinity') || title.includes('spacious'))) {
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
