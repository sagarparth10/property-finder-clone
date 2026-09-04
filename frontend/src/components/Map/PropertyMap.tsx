'use client';

import { useState } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Property {
  id: string;
  lat: number;
  lng: number;
  title: string;
  price: number;
  image: string;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (propertyId: string) => void;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

export function PropertyMap({ properties, onPropertyClick, initialViewState }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const defaultViewState = initialViewState || {
    longitude: 55.2708,
    latitude: 25.2048,
    zoom: 12,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // GeoJSON for property points
  const geoJsonData = {
    type: 'FeatureCollection',
    features: properties.map(prop => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [prop.lng, prop.lat],
      },
      properties: prop,
    })),
  };

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      <Map
        initialViewState={defaultViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.lng}
            latitude={property.lat}
            anchor="bottom"
          >
            <button
              onClick={() => {
                setSelectedProperty(property);
                onPropertyClick?.(property.id);
              }}
              className="bg-primary-500 text-white px-3 py-2 rounded-full shadow-lg hover:bg-primary-600 transition font-semibold text-sm"
            >
              {formatPrice(property.price)}
            </button>
          </Marker>
        ))}

        {/* GeoJSON Layer */}
        <Source id="properties" type="geojson" data={geoJsonData}>
          <Layer
            id="property-points"
            type="circle"
            paint={{
              'circle-color': '#0ea5e9',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {/* Popup for selected property */}
        {selectedProperty && (
          <Popup
            longitude={selectedProperty.lng}
            latitude={selectedProperty.lat}
            onClose={() => setSelectedProperty(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            className="rounded-xl"
          >
            <div className="p-2 w-64">
              <img
                src={selectedProperty.image}
                alt={selectedProperty.title}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                {selectedProperty.title}
              </h3>
              <p className="text-primary-600 font-bold text-lg">
                {formatPrice(selectedProperty.price)}
              </p>
              <button
                onClick={() => {
                  onPropertyClick?.(selectedProperty.id);
                  setSelectedProperty(null);
                }}
                className="mt-2 w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium text-sm"
              >
                View Details
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium transition">
            List
          </button>
          <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
            Map
          </button>
        </div>
      </div>
    </div>
  );
}

