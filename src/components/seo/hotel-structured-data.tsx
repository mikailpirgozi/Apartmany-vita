'use client'

/**
 * Hotel/LodgingBusiness structured data for Google Maps and Google Travel
 * This enables rich snippets with prices, ratings, and booking functionality
 */
export function HotelStructuredData() {
  const hotelData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": "https://www.apartmanvita.sk/#lodging",
    "name": "Apartmány Vita Trenčín",
    "alternateName": "Apartmány Vita",
    "description": "Moderné apartmány v centre Trenčína. Design, Lite a Deluxe apartmány s plným vybavením.",
    "url": "https://www.apartmanvita.sk",
    "telephone": "+421940728676",
    "email": "info@apartmanvita.sk",
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
    "checkinTime": "15:00",
    "checkoutTime": "11:00",
    "numberOfRooms": 3,
    "petsAllowed": false,
    "smokingAllowed": false,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Štúrovo námestie 132/16",
      "addressLocality": "Trenčín",
      "postalCode": "911 01",
      "addressCountry": "SK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 48.8951,
      "longitude": 18.0447
    },
    "image": [
      "https://www.apartmanvita.sk/og-default.jpg"
    ],
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.8",
      "bestRating": "5"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Air Conditioning",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Kitchen",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Parking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Elevator",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Smart TV",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Non-smoking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Family-friendly",
        "value": true
      }
    ],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.apartmanvita.sk/booking",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "LodgingReservation",
        "name": "Rezervácia apartmánu"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelData) }}
    />
  );
}
