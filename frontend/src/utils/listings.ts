import { demoHeroImage, withDemoListingMedia } from '@/data/demoListingMedia';

export function toListingCard(property: any) {
  const id = String(property._id || property.id);
  const enriched = withDemoListingMedia(property, undefined, id);
  return {
    id,
    title: enriched.title,
    price: enriched.price,
    location: enriched.location,
    bedrooms: enriched.bedrooms,
    bathrooms: enriched.bathrooms,
    area: enriched.area,
    image:
      demoHeroImage(enriched, id) ||
      enriched.images?.[0] ||
      enriched.image ||
      '/media/marina-exterior.webp',
    type: enriched.type,
    furnished: !!enriched.furnished,
    verified: !!enriched.verified,
  };
}

export function formatAed(price: number) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(price);
}
