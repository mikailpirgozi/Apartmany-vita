// Beds24 API Schemas - Account & User Types
// ==========================================

// Account
export interface Account {
  id: number;
  balance?: number;
  charge?: number;
  channelCollectInvoice?: string;
  controlCss?: string;
  controlLanguage?: string;
  controlMenu?: string;
  controlText?: string;
  dateFormat?: string;
  decimalPlaces?: string;
  deduceLanguage?: string;
  exportData?: string;
  oneTimeVouchers?: string;
  hidePages?: string;
  hideSettings?: string;
  readonlyPages?: string;
  subControlCss?: string;
  subControlText?: string;
  subHidePages?: string;
  subHideSettings?: string;
  subReadonlyPages?: string;
  template1?: string;
  template2?: string;
  template3?: string;
  template4?: string;
  template5?: string;
  template6?: string;
  template7?: string;
  template8?: string;
  timezone?: string;
  unitStatusValues?: string[];
  windowStyle?: string;
  usage?: {
    numProperties: number;
    numRooms: number;
    numRoomTypes: number;
    numActivities: number;
    numLinks: number;
    channelLinks?: unknown;
  };
  subAccounts?: SubAccount[];
}

// Sub Account
export interface SubAccount {
  [key: string]: unknown;
}

// Organization User
export interface OrganizationUser {
  ownerId: number;
  masterId?: string | null;
  email: string;
  properties: {
    id: number;
    name: string;
    country: string;
    currency: string;
    roomTypes: {
      id: number;
      name: string;
      qty: number;
    }[];
  }[];
}

// Airbnb Listing
export interface AirbnbListing {
  roomId: number;
  name: string;
  enabled: boolean;
  airbnbListing: {
    id: string;
    name: string;
    property_type_category: string;
    room_type_category: string;
    bedrooms: number;
    bathrooms: number;
    beds: number;
    check_in_option: {
      category: string;
    };
    has_availability: boolean;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country_code: string;
    lat: number;
    lng: number;
    directions: string;
    person_capacity: number;
    synchronization_category: string;
    listing_nickname: string;
    tier: string;
    display_exact_location_to_guest: boolean;
    house_manual: string;
    amenities: {
      [key: string]: unknown;
    }[];
    rate_plan_enabled: boolean;
  };
}

// Booking Review
export interface BookingReview {
  [key: string]: unknown;
}

// Airbnb Review
export interface AirbnbReview {
  [key: string]: unknown;
}
