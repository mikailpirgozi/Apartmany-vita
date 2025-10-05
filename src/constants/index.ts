// App constants
export const APP_NAME = "Apartmány Vita"
export const APP_DESCRIPTION = "Luxusné apartmány v centre Trenčína"
export const APP_URL = "https://apartmanvita.sk"

// Contact information
export const CONTACT_INFO = {
  phone: "+421 940 728 676",
  email: "info@apartmanvita.sk",
  whatsapp: "421940728676",
  address: {
    street: "Štúrovo námestie 132/16",
    city: "Trenčín",
    postalCode: "911 01",
    country: "Slovensko"
  },
  coordinates: {
    lat: 48.894161,
    lng: 18.039158
  }
}

// Social media links
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/p/Apartm%C3%A1ny-Vita-Tren%C4%8D%C3%ADn-61558947693181/",
  instagram: "https://www.instagram.com/apartman_vita_trencin/",
  google: "https://g.page/apartmanvita"
}

// Apartment amenities
export const AMENITIES = [
  { id: "wifi", name: "WiFi", icon: "Wifi" },
  { id: "kitchen", name: "Kuchyňa", icon: "ChefHat" },
  { id: "parking", name: "Parkovanie", icon: "Car" },
  { id: "tv", name: "TV", icon: "Tv" },
  { id: "ac", name: "Klimatizácia", icon: "Snowflake" },
  { id: "heating", name: "Kúrenie", icon: "Thermometer" },
  { id: "washer", name: "Práčka", icon: "Shirt" },
  { id: "dishwasher", name: "Umývačka", icon: "Utensils" },
  { id: "balcony", name: "Balkón", icon: "Trees" },
  { id: "elevator", name: "Výťah", icon: "ArrowUp" },
  { id: "pets", name: "Domáce zvieratá", icon: "Heart" },
  { id: "smoking", name: "Fajčenie", icon: "Cigarette" }
] as const

// Booking constants
export const BOOKING_CONSTANTS = {
  MIN_STAY_NIGHTS: 1,
  MAX_STAY_NIGHTS: 30,
  MAX_GUESTS: 8,
  MAX_CHILDREN: 6,
  CHECK_IN_TIME: "15:00",
  CHECK_OUT_TIME: "11:00",
  CANCELLATION_HOURS: 24
}

// Loyalty system
export const LOYALTY_DISCOUNTS = {
  BRONZE: 0.05, // 5%
  SILVER: 0.07, // 7%
  GOLD: 0.10    // 10%
}

export const LOYALTY_THRESHOLDS = {
  SILVER: 3, // bookings
  GOLD: 6    // bookings
}

// Pricing
export const PRICING_CONSTANTS = {
  WEEKEND_MULTIPLIER: 1.2,
  HOLIDAY_MULTIPLIER: 1.5,
  LAST_MINUTE_DISCOUNT: 0.15, // 15% for bookings within 7 days
  LONG_STAY_DISCOUNT: 0.10,   // 10% for stays 7+ nights (deprecated - use STAY_DISCOUNTS)
  EARLY_BIRD_DISCOUNT: 0.05   // 5% for bookings 30+ days in advance
}

// Stay-based discount system (independent of user registration)
export const STAY_DISCOUNTS = {
  WEEK_STAY: { minNights: 7, discount: 0.10, label: "7+ dní" },      // 10% for 7+ nights
  TWO_WEEK_STAY: { minNights: 14, discount: 0.15, label: "14+ dní" }, // 15% for 14+ nights  
  MONTH_STAY: { minNights: 30, discount: 0.20, label: "30+ dní" }     // 20% for 30+ nights
} as const

// Supported languages
export const SUPPORTED_LOCALES = [
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' }
] as const

// API endpoints
export const API_ENDPOINTS = {
  APARTMENTS: '/api/apartments',
  BOOKINGS: '/api/bookings',
  USERS: '/api/users',
  REVIEWS: '/api/reviews',
  NEWSLETTER: '/api/newsletter',
  CONTACT: '/api/contact',
  CHAT: '/api/chat',
  AVAILABILITY: '/api/availability',
  PRICING: '/api/pricing'
}

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "Nastala neočakávaná chyba. Skúste to znovu.",
  NETWORK: "Problém s pripojením. Skontrolujte internetové pripojenie.",
  VALIDATION: "Neplatné údaje. Skontrolujte formulár.",
  UNAUTHORIZED: "Nemáte oprávnenie na túto akciu.",
  NOT_FOUND: "Požadovaný obsah sa nenašiel.",
  BOOKING_CONFLICT: "Apartmán nie je dostupný v zvolenom termíne.",
  PAYMENT_FAILED: "Platba sa nepodarila. Skúste to znovu."
}

// Success messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: "Rezervácia bola úspešne vytvorená!",
  PROFILE_UPDATED: "Profil bol úspešne aktualizovaný!",
  NEWSLETTER_SUBSCRIBED: "Úspešne ste sa prihlásili k odberu noviniek!",
  MESSAGE_SENT: "Správa bola úspešne odoslaná!",
  PASSWORD_RESET: "Na váš email sme poslali odkaz na obnovenie hesla."
}

// Apartment configurations for BEDS24 integration
export const APARTMENTS = [
  {
    slug: 'design-apartman',
    propId: process.env.BEDS24_PROP_ID_DESIGN || '227484',
    roomId: process.env.BEDS24_ROOM_ID_DESIGN || '483027'
  },
  {
    slug: 'lite-apartman',
    propId: process.env.BEDS24_PROP_ID_LITE || '168900',
    roomId: process.env.BEDS24_ROOM_ID_LITE || '357932'
  },
  {
    slug: 'deluxe-apartman',
    propId: process.env.BEDS24_PROP_ID_DELUXE || '161445',
    roomId: process.env.BEDS24_ROOM_ID_DELUXE || '357931'
  }
] as const

// Feature flags
export const FEATURE_FLAGS = {
  CHATBOT_ENABLED: true,
  REVIEWS_ENABLED: true,
  NEWSLETTER_ENABLED: true,
  LOYALTY_PROGRAM_ENABLED: true,
  WHATSAPP_ENABLED: true,
  MULTI_LANGUAGE_ENABLED: true
}
