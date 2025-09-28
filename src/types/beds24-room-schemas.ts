// Beds24 API Schemas - Room Types
// ================================

import { RoomType, BookingType } from './beds24-api-schemas';

// Room Core
export interface Room {
  id?: number;
  propertyId?: number;
  name?: string;
  roomType?: RoomType;
  qty?: number;
  minPrice?: number;
  maxPeople?: number;
  maxAdult?: number | null;
  maxChildren?: number | null;
  minStay?: number | null;
  maxStay?: number | null;
  restrictionStrategy?: 'stayThrough' | 'arrival';
  taxPercentage?: number;
  taxPerson?: number;
  rackRate?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  sellPriority?: number | null;
  roomSize?: number | null;
  highlightColor?: string;
  includeReports?: boolean;
  overbookingProtection?: 'enable' | 'disable';
  blockAfterCheckOutDays?: number;
  controlPriority?: number | null;
  dependencies?: RoomDependencies;
  templates?: {
    template1?: string;
    template2?: string;
    template3?: string;
    template4?: string;
    template5?: string;
    template6?: string;
    template7?: string;
    template8?: string;
  };
  texts?: RoomText[];
  unitAllocation?: 'perBooking' | 'perGuest';
  unallocatedUnit?: {
    name?: string;
    name2?: string;
    name3?: string;
    name4?: string;
    name5?: string;
    name6?: string;
    name7?: string;
    name8?: string;
  };
  units?: RoomUnit[];
  offers?: RoomOffer[];
  featureCodes?: string[][];
  priceRules?: PriceRule[];
}

// Room Dependencies
export interface RoomDependencies {
  includeSubDependencies?: boolean;
  combinationLogic?: unknown;
  includeBookingsRoomId1?: number | null;
  includeBookingsRoomId2?: number | null;
  includeBookingsRoomId3?: number | null;
  includeBookingsRoomId4?: number | null;
  includeBookingsRoomId5?: number | null;
  includeBookingsRoomId6?: number | null;
  includeBookingsRoomId7?: number | null;
  includeBookingsRoomId8?: number | null;
  includeBookingsRoomId9?: number | null;
  includeBookingsRoomId10?: number | null;
  includeBookingsRoomId11?: number | null;
  includeBookingsRoomId12?: number | null;
  dependentRoomId1?: number | null;
  dependentRoomId2?: number | null;
  dependentRoomId3?: number | null;
  dependentRoomId4?: number | null;
  dependentRoomId5?: number | null;
  dependentRoomId6?: number | null;
  dependentRoomId7?: number | null;
  dependentRoomId8?: number | null;
  dependentRoomId9?: number | null;
  dependentRoomId10?: number | null;
  dependentRoomId11?: number | null;
  dependentRoomId12?: number | null;
  assignBookingsTo?: unknown;
}

// Room Text
export interface RoomText {
  language: 'en' | 'ar' | 'bg' | 'ca' | 'cs' | 'da' | 'de' | 'el' | 'es' | 'et' | 'fi' | 'fr' | 'hr' | 'he' | 'hu' | 'id' | 'is' | 'it' | 'ja' | 'ko' | 'lt' | 'mn' | 'my' | 'nl' | 'no' | 'pl' | 'pt' | 'ro' | 'ru' | 'sk' | 'sl' | 'sr' | 'sv' | 'th' | 'tr' | 'vi' | 'zh' | 'zt';
  name?: string;
  description?: string;
  [key: string]: unknown;
}

// Room Unit
export interface RoomUnit {
  unitId?: number;
  name?: string;
  name2?: string;
  name3?: string;
  name4?: string;
  name5?: string;
  name6?: string;
  name7?: string;
  name8?: string;
  status?: string;
  [key: string]: unknown;
}

// Room Offer
export interface RoomOffer {
  offerId: number;
  enable: 'onlyIfAvailable' | 'no' | 'always' | 'internal' | 'internalManual';
  name?: string;
  position?: number;
  bookingType?: BookingType;
  minimumStay?: {
    type: 'numberOfDays' | 'default';
    numberOfDaysValue?: number | null;
  };
  allowCancellation?: {
    type: 'daysBeforeArrival' | 'propertyRule' | 'always' | 'never';
    daysBeforeArrivalValue?: number | null;
  };
}

// Price Rule
export interface PriceRule {
  id?: number;
  name?: string;
  priceFor?: unknown;
  extraPerson?: number;
  extraChild?: number;
  minimumStay?: number;
  maximumStay?: number;
  offer?: number;
  minDaysUntilCheckin?: number;
  maxDaysUntilCheckin?: number;
  color?: string;
  priceLinking?: {
    roomId?: number | null;
    priceId?: number | null;
    offsetMultiplier?: number;
    offsetAmount?: number | null;
  };
  agentCodes?: string[];
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
    vrbo?: unknown;
    expedia?: unknown;
    tripadvisorrentals?: unknown;
    [key: string]: unknown;
  };
  upsellItems?: {
    index: number;
    enable: boolean;
  }[];
  voucherCodes?: {
    index: number;
    enabled: boolean;
  }[];
}
