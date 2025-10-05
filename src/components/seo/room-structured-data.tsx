'use client'

interface RoomStructuredDataProps {
  apartment: {
    name: string;
    slug: string;
    description: string;
    size: number;
    maxGuests: number;
    basePrice: number;
    images: string[];
    amenities: string[];
  };
}

/**
 * HotelRoom structured data for individual apartments
 * Enables rich snippets with pricing and booking for each room
 */
export function RoomStructuredData({ apartment }: RoomStructuredDataProps) {
  const roomData = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    "name": `${apartment.name} - Apartmány Vita Trenčín`,
    "description": apartment.description,
    "url": `https://www.apartmanvita.sk/apartments/${apartment.slug}`,
    "image": apartment.images,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": apartment.size,
      "unitCode": "MTK" // square meters
    },
    "occupancy": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": apartment.maxGuests
    },
    "bed": {
      "@type": "BedDetails",
      "numberOfBeds": apartment.maxGuests <= 2 ? 1 : 2,
      "typeOfBed": apartment.maxGuests <= 2 ? "Manželská posteľ" : "Manželská + jednolôžková"
    },
    "amenityFeature": apartment.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "offers": {
      "@type": "Offer",
      "price": apartment.basePrice,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": `https://www.apartmanvita.sk/booking?apartment=${apartment.slug}`,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": apartment.basePrice,
        "priceCurrency": "EUR",
        "unitText": "za noc"
      }
    },
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://www.apartmanvita.sk/booking?apartment=${apartment.slug}`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(roomData) }}
    />
  );
}
