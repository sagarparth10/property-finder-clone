'use client';

import Image from 'next/image';
import { Heart, MapPin, Bed, Bath, Square, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ListingCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    image: string;
    type: string;
    furnished: boolean;
    verified: boolean;
  };
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
}

export function ListingCard({ property, onView, onSave }: ListingCardProps) {
  const href = `/properties/${property.id}/`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group min-w-0 overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      <a
        href={href}
        className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        onClick={() => onView?.(property.id)}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-gray-200 sm:h-56 md:h-64">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Verified Badge */}
          {property.verified && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave?.(property.id);
              }}
              className="rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white"
            >
              <Heart className="h-4 w-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white"
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 p-4 sm:p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <span className="min-w-0 break-words text-base font-bold text-primary-600 sm:text-lg">
              {formatPrice(property.price)}
              {property.type === 'rent' && <span className="text-sm font-normal text-gray-500">/year</span>}
            </span>
            <span className="shrink-0 rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
              {property.type}
            </span>
          </div>

          <h3 className="mb-2 line-clamp-1 text-base font-semibold text-gray-900 sm:text-lg">
            {property.title}
          </h3>

          <div className="mb-3 flex min-w-0 items-center text-gray-600">
            <MapPin className="mr-1 h-4 w-4 shrink-0" />
            <span className="truncate text-sm">{property.location}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-700">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span className="text-sm font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span className="text-sm font-medium">{property.area} sqft</span>
            </div>
          </div>

          {property.furnished && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                Furnished
              </span>
            </div>
          )}
        </div>
      </a>
    </motion.div>
  );
}
