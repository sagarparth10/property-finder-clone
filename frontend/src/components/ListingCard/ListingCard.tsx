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
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={() => {
        if (onView) onView(property.id);
        else if (typeof window !== 'undefined') window.location.href = `/properties/${property.id}`;
      }}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Verified Badge */}
        {property.verified && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.(property.id);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition"
          >
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(property.price)}
            {property.type === 'rent' && <span className="text-sm font-normal text-gray-500">/year</span>}
          </span>
          <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
            {property.type}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 text-gray-700">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span className="text-sm font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span className="text-sm font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span className="text-sm font-medium">{property.area} sqft</span>
          </div>
        </div>

        {property.furnished && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">
              Furnished
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

