import PropertyDetailClient from './PropertyDetailClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />;
}
