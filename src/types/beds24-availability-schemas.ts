// Beds24 API Schemas - Availability & Calendar Types
// ===================================================

// Availability
export interface Availability {
  roomId: number;
  propertyId: number;
  name: string;
  availability: {
    [date: string]: boolean; // Date as key (YYYY-MM-DD), boolean as value
  };
}

// Unit Bookings
export interface UnitBookings {
  roomId: number;
  propertyId: number;
  name: string;
  qty: number;
  unitBookings: {
    [date: string]: { // Date as key (YYYY-MM-DD)
      [unitId: string]: number; // Unit ID as key, number of bookings as value
      unassigned: number; // Number of unassigned bookings
    };
  };
}

// Calendar
export interface Calendar {
  roomId: number;
  calendar: CalendarEntry[];
}

export interface CalendarEntry {
  from: string; // date format YYYY-MM-DD
  to: string; // date format YYYY-MM-DD
  numAvail?: number | null; // Can be negative if overbooked
  minStay?: number | null;
  maxStay?: number | null;
  multiplier?: number;
  override?: 'none' | 'blackout' | 'closed' | 'open' | 'price' | 'minStay';
  price1?: number | null;
  price2?: number | null;
  price3?: number | null;
  price4?: number | null;
  price5?: number | null;
  price6?: number | null;
  price7?: number | null;
  price8?: number | null;
  price9?: number | null;
  price10?: number | null;
  price11?: number | null;
  price12?: number | null;
  price13?: number | null;
  price14?: number | null;
  price15?: number | null;
  price16?: number | null;
  channels?: {
    agoda?: ChannelBookingLimit;
    airbnb?: ChannelBookingLimit;
    asiatravel?: ChannelBookingLimit;
    atraveode?: ChannelBookingLimit;
    booking?: ChannelBookingLimit;
    despegar?: ChannelBookingLimit;
    edreamsodigeo?: ChannelBookingLimit;
    expedia?: ChannelBookingLimit;
    feratel?: ChannelBookingLimit;
    goibibo?: ChannelBookingLimit;
    hometogo?: ChannelBookingLimit;
    hostelworld?: ChannelBookingLimit;
    hotelbeds?: ChannelBookingLimit;
    hrs?: ChannelBookingLimit;
    jomres?: ChannelBookingLimit;
    marriott?: ChannelBookingLimit;
    ostrovokru?: ChannelBookingLimit;
    ota?: ChannelBookingLimit;
    reserva?: ChannelBookingLimit;
    tiket?: ChannelBookingLimit;
    tomastravel?: ChannelBookingLimit;
    traveloka?: ChannelBookingLimit;
    travia?: ChannelBookingLimit;
    traum?: ChannelBookingLimit;
    trip?: ChannelBookingLimit;
    tripadvisorrentals?: ChannelBookingLimit;
    vacationstay?: ChannelBookingLimit;
    vrbo?: ChannelBookingLimit;
  };
}

export interface ChannelBookingLimit {
  maxBookings?: number | null;
}

// Fixed Price
export interface FixedPrice {
  id?: number;
  roomId: number;
  propertyId: number;
  offerId: number;
  firstNight: string; // date format YYYY-MM-DD
  lastNight: string; // date format YYYY-MM-DD
  name?: string;
  minNights?: number;
  maxNights?: number;
  minAdvance?: number;
  maxAdvance?: number;
  strategy?: 'default' | 'noLowerPriceOrShorterStays' | 'noOtherPrices';
  restrictionStrategy?: 'stayThrough' | 'arrival' | 'gapFill';
  bookingType?: 'default' | 'requestWithManualConfirmation' | 'requestWithCreditCard' | 'confirmedWithCreditCard' | 'confirmedWithDepositCollection1' | 'confirmedWithDepositCollection2';
  allowEnquiry?: boolean;
  allowMultiplier?: boolean;
  pricesPerNights?: number;
  color?: string;
  roomPrice?: number;
  roomPriceEnable?: boolean;
  roomPriceGuests?: number;
  '1PersonPrice'?: number;
  '1PersonPriceEnable'?: boolean;
  '2PersonPrice'?: number;
  '2PersonPriceEnable'?: boolean;
  extraPersonPrice?: number;
  extraPersonPriceEnable?: boolean;
  extraChildPrice?: number;
  allowAloneChildren?: boolean;
  extraChildPriceEnable?: boolean;
  channelManagement?: 'notUsed' | 'exportPrice' | 'normalPrice';
  exportPrice?: number;
  agentCodes?: string[];
  allowedDays?: {
    mon?: boolean;
    tue?: boolean;
    wed?: boolean;
    thu?: boolean;
    fri?: boolean;
    sat?: boolean;
    sun?: boolean;
  };
  checkInDays?: {
    mon?: boolean;
    tue?: boolean;
    wed?: boolean;
    thu?: boolean;
    fri?: boolean;
    sat?: boolean;
    sun?: boolean;
  };
  checkOutDays?: {
    mon?: boolean;
    tue?: boolean;
    wed?: boolean;
    thu?: boolean;
    fri?: boolean;
    sat?: boolean;
    sun?: boolean;
  };
  discounts?: {
    index: number;
    nights?: number;
    percent?: number;
    perNight?: number;
    onceOff?: number;
    priceCap?: number;
  }[];
  refererDiscounts?: {
    index: number;
    code?: string;
    percent?: number;
    perNight?: number;
    onceOff?: number;
  }[];
  upsellItems?: {
    index: number;
    enable: boolean;
  }[];
  voucherCodes?: {
    index: number;
    enable: boolean;
  }[];
  bookingPage?: {
    direct?: boolean;
    agent?: boolean;
  };
  channels?: {
    agoda?: unknown;
    airbnb?: {
      enabled?: boolean;
      rateCode?: string;
    };
    booking?: {
      enabled?: boolean;
      rateCode?: string;
    };
    [key: string]: unknown;
  };
}
