import type {
  Booking,
  BookingService,
  BookingTenant,
  Slot,
} from "../types";

export interface CreateBookingParams {
  bookingTenantId: string;
  serviceId: string;
  slotStartUtc: string; // ISO 8601
  contact: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  locale?: string;
}

export interface CreatedBooking {
  bookingId: string;
  slotStartUtc: string;
  slotEndUtc: string;
  /** Raw token (no hasheado). Solo se devuelve una vez, viajar por email. */
  confirmToken: string;
  /** Raw token (no hasheado). Solo se devuelve una vez. */
  cancelToken: string;
  status: Booking["status"];
}

export interface ConfirmedBooking {
  booking: Booking;
}

export interface BookingProvider {
  getAvailability(params: {
    bookingTenantId: string;
    serviceId: string;
    fromUtc: string;
    toUtc: string;
  }): Promise<Slot[]>;

  getServices(params: { bookingTenantId: string }): Promise<BookingService[]>;

  getTenant(params: { bookingTenantId: string }): Promise<BookingTenant>;

  createBooking(params: CreateBookingParams): Promise<CreatedBooking>;

  confirmBooking(params: {
    rawToken: string;
    bookingId: string;
  }): Promise<ConfirmedBooking>;

  cancelBooking(params: {
    rawToken: string;
    bookingId: string;
    by: "customer" | "business";
    reason?: string;
  }): Promise<ConfirmedBooking>;
}
