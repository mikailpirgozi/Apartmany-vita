// Beds24 API Schemas - Property Types
// ====================================

import { PropertyType, BookingType, CancellationType } from './beds24-api-schemas';

// Property Core
export interface Property {
  account?: {
    ownerId: number;
    unitStatuses: {
      text: string;
      color: string;
    }[];
  };
  id?: number;
  name?: string;
  propertyType?: PropertyType;
  currency?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  web?: string;
  contactFirstName?: string;
  contactLastName?: string;
  checkInStart?: string;
  checkInEnd?: string;
  checkOutEnd?: string;
  offerType?: 'perRoom' | 'perProperty';
  sellPriority?: number | null;
  controlPriority?: number | null;
  bookingPageMultiplier?: string;
  permit?: string;
  roomChargeDisplay?: 'onePerBooking' | 'onePerDate';
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
  bookingRules?: {
    bookingType?: BookingType;
    bookingNearTypeDays?: number | null;
    bookingNearType?: BookingType;
    bookingExceptionalType?: BookingType;
    bookingExceptionalTypeStart?: string;
    bookingExceptionalTypeEnd?: string;
    bookingCutOffHour?: number;
    dailyPriceStrategy?: 'allowLower' | 'doNotAllowLower' | 'doNotAllowOtherRates';
    dailyPriceType?: BookingType;
    vatRatePercentage?: number;
    priceRounding?: string;
    allowGuestCancellation?: {
      type: CancellationType;
      daysBeforeArrivalValue?: number | null;
    };
  };
  paymentCollection?: {
    depositNonPayment?: 'cancel' | 'allow';
    depositPayment1?: {
      fixedAmount?: number;
      variableAmount?: {
        type: 'fixed' | 'percentage';
        percentageValue?: number | null;
      };
    };
    depositPayment2?: {
      fixedAmount?: number;
      variableAmount?: {
        type: 'fixed' | 'percentage';
        percentageValue?: number | null;
      };
    };
  };
  paymentGateways?: {
    stripe?: {
      type: 'enable' | 'disable' | 'test';
      priority?: number;
      saveAllCards?: boolean;
      capture?: boolean;
      checkoutVersion?: 'embedded' | 'hosted';
      paymentDescription?: string;
    };
    [key: string]: unknown; // Other payment gateways
  };
  cardSettings?: {
    cardRequireCVV?: boolean;
    cardAcceptAmex?: boolean;
    cardAcceptDiners?: boolean;
    cardAcceptDiscover?: boolean;
    cardAcceptEnroute?: boolean;
    cardAcceptJcb?: boolean;
    cardAcceptMaestro?: boolean;
    cardAcceptMaster?: boolean;
    cardAcceptUnionpay?: boolean;
    cardAcceptVisa?: boolean;
    cardAcceptVoyager?: boolean;
  };
  groupKeywords?: string[];
  oneTimeVouchers?: {
    phrase: string;
    discount: number;
  }[];
  discountVouchers?: {
    number: number;
    phrase: string;
    discount: number;
    type: 'percentage' | 'fixed' | 'nights' | 'percentageNights' | 'fixedNights' | 'percentageStay' | 'fixedStay';
  }[];
  featureCodes?: string[][];
  texts?: PropertyText[];
  offers?: PropertyOffer[];
  roomTypes?: string[];
  upsellItems?: unknown[];
  bookingQuestions?: unknown;
  webhooks?: {
    version: 'v1' | 'v2' | 'v3';
    url?: string;
    additionalData?: 'none' | 'booking' | 'property' | 'all';
    customHeader?: string;
  };
}

// Property Text
export interface PropertyText {
  language: 'en' | 'ar' | 'bg' | 'ca' | 'cs' | 'da' | 'de' | 'el' | 'es' | 'et' | 'fi' | 'fr' | 'hr' | 'he' | 'hu' | 'id' | 'is' | 'it' | 'ja' | 'ko' | 'lt' | 'mn' | 'my' | 'nl' | 'no' | 'pl' | 'pt' | 'ro' | 'ru' | 'sk' | 'sl' | 'sr' | 'sv' | 'th' | 'tr' | 'vi' | 'zh' | 'zt';
  houseRules?: string;
  directions?: string;
  headline?: string;
  propertyDescription?: string;
  propertyDescription1?: string;
  propertyDescription2?: string;
  propertyDescriptionBookingPage1?: string;
  propertyDescriptionBookingPage2?: string;
  guestDetailsHeader?: string;
  guestEnquiryHeader?: string;
  confirmBookingButtonMessage?: string;
  roomNotAvailableMessage?: string;
  roomNoPriceMessage?: string;
  noRoomsAvailableMessage?: string;
  generalPolicy?: string;
  cancellationPolicy?: string;
  locationDescription?: string;
  customQuestion1?: string;
  customQuestion2?: string;
  customQuestion3?: string;
  customQuestion4?: string;
  customQuestion5?: string;
  customQuestion6?: string;
  customQuestion7?: string;
  customQuestion8?: string;
  customQuestion9?: string;
  customQuestion10?: string;
  // Upsell items (1-20)
  [key: `upsellItemName${number}`]: string;
  [key: `upsellItemDescription${number}`]: string;
  // Offers (1-16)
  [key: `offerName${number}`]: string;
  [key: `offerDescription${number}`]: string;
  [key: `offerMoreDetail${number}`]: string;
  [key: `offerMarketing${number}`]: string;
}

// Property Offer
export interface PropertyOffer {
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
