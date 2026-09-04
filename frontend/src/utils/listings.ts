import { isVillaDemoListing, VILLA_DEMO_IMAGES } from '@/data/villaDemoMedia';

export function toListingCard(property: any) {
  const id = String(property._id || property.id);
  const villaDemo = isVillaDemoListing(property, id);
  return {
    id,
    title: property.title,
    price: property.price,
    location: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    image: villaDemo
      ? VILLA_DEMO_IMAGES[0]
      : property.images?.[0] ||
        property.image ||
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    type: property.type,
    furnished: !!property.furnished,
    verified: !!property.verified,
  };
}

export function formatAed(price: number) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(price);
}
