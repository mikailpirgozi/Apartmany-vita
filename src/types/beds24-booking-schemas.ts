// Beds24 API Schemas - Booking Types
// ===================================

import { 
  BookingStatus, 
  BookingSubStatus, 
  BookingChannel, 
  CancellationType,
  InvoiceItemType,
  MessageSource 
} from './beds24-api-schemas';

// Booking Core
export interface Booking {
  id?: number;
  propertyId?: number;
  apiSourceId?: number;
  apiSource?: string;
  channel?: BookingChannel;
  bookingGroup?: {
    master: number;
    ids: number[];
  } | null;
  masterId?: number | null;
  roomId: number;
  unitId?: number;
  roomQty?: number;
  status?: BookingStatus;
  arrival: string; // date format YYYY-MM-DD
  departure: string; // date format YYYY-MM-DD
  numAdult?: number;
  numChild?: number;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country2?: string | null;
  arrivalTime?: string;
  voucher?: string;
  comments?: string;
  notes?: string;
  message?: string;
  groupNote?: string | null;
  custom1?: string;
  custom2?: string;
  custom3?: string;
  custom4?: string;
  custom5?: string;
  custom6?: string;
  custom7?: string;
  custom8?: string;
  custom9?: string;
  custom10?: string;
  flagColor?: string;
  flagText?: string;
  lang?: string;
  price?: number;
  deposit?: number;
  tax?: number;
  commission?: number;
  refererEditable?: string;
  rateDescription?: string;
  invoiceeId?: number | null;
  stripeToken?: string | null;
  apiMessage?: string;
  invoiceItems?: InvoiceItemPost[];
  infoItems?: unknown[];
  subStatus?: BookingSubStatus;
  statusCode?: number;
  offerId?: number;
  referer?: string;
  reference?: string;
  apiReference?: string;
  allowChannelUpdate?: 'none' | 'all' | 'allExceptRoomChange';
  allowAutoAction?: 'disable' | 'enable';
  allowReview?: 'default' | 'disable' | 'enable';
  allowCancellation?: {
    type: CancellationType;
    daysBeforeArrivalValue?: number | null;
  };
  bookingTime?: string;
  modifiedTime?: string;
  cancelTime?: string | null;
}

export interface NewBooking extends Omit<Booking, 'id' | 'bookingTime' | 'modifiedTime' | 'cancelTime'> {
  // Additional fields for new bookings
  [key: string]: unknown;
}

// Booking Guests
export interface BookingGuests {
  guests: {
    id?: number;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country2?: string;
    flagText?: string;
    flagColor?: string;
    note?: string;
    custom1?: string;
    custom2?: string;
    custom3?: string;
    custom4?: string;
    custom5?: string;
    custom6?: string;
    custom7?: string;
    custom8?: string;
    custom9?: string;
    custom10?: string;
  }[];
}

// Booking Actions
export interface BookingActions {
  actions: {
    notifyGuest?: boolean;
    notifyHost?: boolean;
    assignBooking?: boolean;
    checkAvailability?: boolean;
    makeGroup?: boolean;
    assignInvoiceNumber?: boolean;
    assignInvoiceNumberInvoicee?: number;
    autoInvoiceItemCharge?: boolean;
    deleteInvoice?: boolean;
    allowWebhooks?: boolean;
  };
}

// Offer Response
export interface OfferResponse {
  offerId: number;
  offerName: string;
  price: number;
  unitsAvailable: number;
}

// Invoice Items
export interface InvoiceItemPost {
  id?: number;
  type: InvoiceItemType;
  bookingId?: number;
  invoiceeId?: number | null;
  description?: string;
  status?: string;
  qty?: number;
  amount?: number;
  vatRate?: number;
  createdBy?: number;
}

export interface InvoiceItem extends InvoiceItemPost {
  lineTotal?: number;
  createTime?: string;
}

export interface Invoice {
  invoiceId?: number;
  invoiceDate?: string | null;
  invoiceItems?: InvoiceItem[];
}

// Messages
export interface Message {
  id?: number;
  bookingId?: number;
  read?: boolean | null;
  message?: string;
  attachment?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'application/pdf' | null;
  source: MessageSource;
  roomId?: number;
  propertyId?: number;
  time?: string;
  authorOwnerId?: number;
}

export interface HostMessage {
  id?: number;
  bookingId?: number;
  read?: boolean | null;
  message?: string;
  attachment?: string | null;
  attachmentName?: string | null;
  attachmentMimeType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'application/pdf' | null;
  source: MessageSource;
}
