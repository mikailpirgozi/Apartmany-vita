// Beds24 API Schemas - Settings & Configuration Types
// ====================================================

// iCal Export Settings
export interface ICalExportSettingsGet {
  channel: string;
  properties: {
    id: number;
    seed?: string;
    iCalSumamry?: string;
    iCalPropertyDescription?: string;
    roomTypes: {
      id: number;
      iCalRoomDescription?: string;
      export: 'none' | 'property' | 'room' | 'both';
      iCalUri?: string;
      propertyDescriptionICalUri?: string;
      roomDescriptionICalUri?: string;
      propertyAndRoomDescriptionICalUri?: string;
    }[];
  }[];
}

export interface ICalExportSettingsPost {
  channel: string;
  properties: {
    id: number;
    seed?: string;
    iCalSumamry?: string;
    iCalPropertyDescription?: string;
    roomTypes: {
      id: number;
      iCalRoomDescription?: string;
      export: 'none' | 'property' | 'room' | 'both';
    }[];
  }[];
}

// iCal Import Settings
export interface ICalImportSettingsGet {
  channel: string;
  properties: {
    id: number;
    modificationNotification: 'modificationAllowedBookingNotificationOnly' | 'modificationAllowedBookingCancelNotification' | 'modificationAllowedNoEmailNotification' | 'modificationProhibitedBookingNotificationOnly' | 'modificationProhibitedNoEmailNotification';
    roomTypes: {
      id: number;
      iCalUri1?: string;
      iCalUri2?: string;
      iCalUri3?: string;
      ignoreContaining1?: string;
      ignoreContaining2?: string;
      ignoreContaining3?: string;
      import1: 'none' | 'blackout' | 'bookings' | 'blackoutAndBookings' | 'rates' | 'blackoutAndRates' | 'bookingsAndRates' | 'all' | 'ratesOnly' | 'blackoutOnly';
      import2: 'none' | 'blackout' | 'bookings' | 'blackoutAndBookings' | 'rates' | 'blackoutAndRates' | 'bookingsAndRates' | 'all' | 'ratesOnly' | 'blackoutOnly';
      import3: 'none' | 'blackout' | 'bookings' | 'blackoutAndBookings' | 'rates' | 'blackoutAndRates' | 'bookingsAndRates' | 'all' | 'ratesOnly' | 'blackoutOnly';
    }[];
  }[];
}

export interface ICalImportSettingsPost {
  channel: string;
  properties: {
    id: number;
    modificationNotification: 'modificationAllowedBookingNotificationOnly' | 'modificationAllowedBookingCancelNotification' | 'modificationAllowedNoEmailNotification' | 'modificationProhibitedBookingNotificationOnly' | 'modificationProhibitedNoEmailNotification';
    roomTypes: {
      id: number;
      iCalUri1?: string;
      iCalUri2?: string;
      iCalUri3?: string;
      ignoreContaining1?: string;
      ignoreContaining2?: string;
      ignoreContaining3?: string;
      import1: 'none' | 'blackout' | 'bookings' | 'blackoutAndBookings' | 'rates' | 'blackoutAndRates' | 'bookingsAndRates' | 'all' | 'ratesOnly' | 'blackoutOnly';
      import2: 'none' | 'blackout' | 'bookings' | 'blackoutAndBookings' | 'rates' | 'blackoutAndRates' | 'bookingsAndRates' | 'all' | 'ratesOnly' | 'blackoutOnly';
      import3: 'none' | 'blackout' | 'bookings' | 'blackoutAndBookings' | 'rates' | 'blackoutAndRates' | 'bookingsAndRates' | 'all' | 'ratesOnly' | 'blackoutOnly';
    }[];
  }[];
}

// iCal Import Tools
export interface ICalImportTools {
  deleteBookingTool1?: boolean;
  deleteBookingTool2?: boolean;
  deleteBookingTool3?: boolean;
}

// Nuki Settings
export interface NukiSettingsGet {
  channel: string;
  properties: {
    id: number;
    commonLock?: number;
    startTime?: string; // HH:mm format
    endTime?: string; // HH:mm format
    daysInAdvance?: number;
    autoCheckIn?: boolean;
    roomTypes: {
      id: number;
      allowRemoteAppAccess: 'infoCode' | 'yes' | 'no';
      syncApp?: boolean;
      syncCode?: boolean;
      lockSerialNumbers?: string[];
    }[];
  };
}

export interface NukiSettingsPost {
  channel: string;
  properties: {
    id: number;
    commonLock?: number;
    startTime?: string; // HH:mm format
    endTime?: string; // HH:mm format
    daysInAdvance?: number;
    autoCheckIn?: boolean;
    roomTypes: {
      id: number;
      allowRemoteAppAccess: 'infoCode' | 'yes' | 'no';
      syncApp?: boolean;
      syncCode?: boolean;
      lockSerialNumbers?: {
        [key: string]: any;
      }[];
    }[];
  };
}

// VRBO Settings
export interface VrboSettingsPost {
  channel: string;
  currency: 'USD' | 'AUD' | 'BRL' | 'CAD' | 'EUR' | 'GBP' | 'JPY';
  properties: {
    id: number;
    multiplier?: number;
    invoiceeId?: string | null;
    defaultLanguage?: 'de' | 'en' | 'es' | 'fi' | 'fr' | 'it' | 'ja' | 'nl' | 'no' | 'pt' | 'sov';
    showExactLanguage?: boolean;
    ownerListingStory?: string;
    uniqueBenefits?: string;
    whyPurchased?: string;
    yearPurchased?: string;
    acceptedPaymentType?: 'all' | 'invoiceOnly' | 'cardOnly';
    paymentInvoiceDescription?: string;
    paymentSchedule?: 'immediate' | 'delayed';
    merchantName?: string;
    roomTypes: {
      id: number;
      syncronise?: boolean;
      name?: string;
      priceStrategy?: 'multiplier' | 'fixed';
      guestsIncluded?: number | null;
      extraPersonPrice?: number;
      '2DayDiscountPercent'?: number;
      '3DayDiscountPercent'?: number;
      '4DayDiscountPercent'?: number;
      '5DayDiscountPercent'?: number;
      '6DayDiscountPercent'?: number;
      '7DayDiscountPercent'?: number;
      '14DayDiscountPercent'?: number;
      '21DayDiscountPercent'?: number;
      '28DayDiscountPercent'?: number;
      cancellationPolicy?: 'relaxed' | 'moderate' | 'firm' | 'strict' | 'noRefund' | 'custom';
      custom?: string[];
    }[];
  };
}

export interface VrboSettingsGet {
  [key: string]: any; // Similar to VrboSettingsPost but read-only
}

// Airbnb Settings
export interface AirbnbSettingsPost {
  channel: string;
  properties: {
    id: number;
    multiplier?: string | null;
    currency?: 'AED' | 'ALL' | 'AMD' | 'ARS' | 'AUD' | 'AZN' | 'BDT' | 'BGN' | 'BHD' | 'BND' | 'BRL' | 'CAD' | 'CHF' | 'CLP' | 'CNY' | 'COP' | 'CRC' | 'CZK' | 'DKK' | 'DOP' | 'EGP' | 'EUR' | 'FJD' | 'GBP' | 'GEL' | 'HKD' | 'HRK' | 'HUF' | 'INR' | 'IDR' | 'IRR' | 'ILS' | 'ISK' | 'JOD' | 'JPY' | 'KES' | 'KRW' | 'LBP' | 'LKR' | 'MAD' | 'MMK' | 'MXN' | 'MYR' | 'MZN' | 'NOK' | 'NZD' | 'OMR' | 'PHP' | 'PLN' | 'RON' | 'RSD' | 'RUB' | 'SAR' | 'SEK' | 'SGD' | 'TWD' | 'THB' | 'TND' | 'TRY' | 'TZS' | 'UAH' | 'USD' | 'VND' | 'XOF' | 'XPF' | 'YER' | 'ZAR';
    inquiryAndRequests?: 'ignore' | 'importAll' | 'importOnlyContainingBookingNumber';
    invoiceeId?: string | null;
    roomTypes: {
      [key: string]: any;
    }[];
  }[];
}

export interface AirbnbSettingsGet {
  channel: string;
  properties: {
    airbnbUserId?: string | null;
    id: number;
    multiplier?: string | null;
    currency?: 'AED' | 'ALL' | 'AMD' | 'ARS' | 'AUD' | 'AZN' | 'BDT' | 'BGN' | 'BHD' | 'BND' | 'BRL' | 'CAD' | 'CHF' | 'CLP' | 'CNY' | 'COP' | 'CRC' | 'CZK' | 'DKK' | 'DOP' | 'EGP' | 'EUR' | 'FJD' | 'GBP' | 'GEL' | 'HKD' | 'HRK' | 'HUF' | 'INR' | 'IDR' | 'IRR' | 'ILS' | 'ISK' | 'JOD' | 'JPY' | 'KES' | 'KRW' | 'LBP' | 'LKR' | 'MAD' | 'MMK' | 'MXN' | 'MYR' | 'MZN' | 'NOK' | 'NZD' | 'OMR' | 'PHP' | 'PLN' | 'RON' | 'RSD' | 'RUB' | 'SAR' | 'SEK' | 'SGD' | 'TWD' | 'THB' | 'TND' | 'TRY' | 'TZS' | 'UAH' | 'USD' | 'VND' | 'XOF' | 'XPF' | 'YER' | 'ZAR';
    inquiryAndRequests?: 'ignore' | 'importAll' | 'importOnlyContainingBookingNumber';
    invoiceeId?: string | null;
    roomTypes: {
      [key: string]: any;
    }[];
  }[];
}

// Text Languages
export interface TextLanguages {
  [key: string]: any;
}

// Channel Settings Template
export interface ChannelSettingsTemplate {
  channel: string;
  properties: {
    id: number;
    roomTypes: {
      id: number;
      [key: string]: any;
    }[];
  };
}
