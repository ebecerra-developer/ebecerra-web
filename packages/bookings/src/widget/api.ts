import type { WidgetService, WidgetSlot, WidgetTenant } from "./types";

export class BookingApiError extends Error {
  constructor(public code: string, public status: number, message: string) {
    super(message);
  }
}

export interface BookingApiClient {
  loadCatalog(): Promise<{ tenant: WidgetTenant; services: WidgetService[] }>;
  loadAvailability(args: {
    serviceId: string;
    fromUtc: string;
    toUtc: string;
  }): Promise<{ slots: WidgetSlot[]; timezone: string }>;
  createBooking(args: {
    serviceId: string;
    slotStartUtc: string;
    contact: { name: string; email: string; phone?: string; notes?: string };
    locale: string;
  }): Promise<{ bookingId: string }>;
}

/**
 * Cliente alternativo que usa un manage token en lugar de tenant key.
 * Usado por el widget en modo reschedule.
 */
export interface RescheduleApiClient {
  loadCatalog(): Promise<{ tenant: WidgetTenant; services: WidgetService[] }>;
  loadAvailability(args: {
    serviceId: string;
    fromUtc: string;
    toUtc: string;
  }): Promise<{ slots: WidgetSlot[] }>;
  reschedule(args: {
    newSlotStartUtc: string;
    newServiceId?: string;
  }): Promise<{ newBookingId: string; newManageToken: string }>;
}

export function createRescheduleApi(opts: {
  apiBase: string;
  rawToken: string;
  bookingId: string;
}): RescheduleApiClient {
  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${opts.apiBase}${path}`, { method: "GET" });
    if (!res.ok) throw await toError(res);
    return (await res.json()) as T;
  }
  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${opts.apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await toError(res);
    return (await res.json()) as T;
  }
  return {
    async loadCatalog() {
      const res = await get<{
        tenant: WidgetTenant;
        services: WidgetService[];
      }>(`/api/v1/bookings/by-token?token=${encodeURIComponent(opts.rawToken)}`);
      return { tenant: res.tenant, services: res.services };
    },
    async loadAvailability({ serviceId, fromUtc, toUtc }) {
      return await post<{ slots: WidgetSlot[] }>(`/api/v1/bookings/by-token`, {
        token: opts.rawToken,
        service_id: serviceId,
        from_utc: fromUtc,
        to_utc: toUtc,
      });
    },
    async reschedule({ newSlotStartUtc, newServiceId }) {
      const res = await post<{
        new_booking_id: string;
        new_manage_token: string;
      }>(`/api/v1/bookings/reschedule`, {
        token: opts.rawToken,
        booking_id: opts.bookingId,
        new_slot_start_utc: newSlotStartUtc,
        new_service_id: newServiceId,
      });
      return {
        newBookingId: res.new_booking_id,
        newManageToken: res.new_manage_token,
      };
    },
  };
}

async function toError(res: Response): Promise<BookingApiError> {
  let code = "unknown";
  let message = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    code = body.error?.code ?? code;
    message = body.error?.message ?? message;
  } catch {}
  return new BookingApiError(code, res.status, message);
}

export function createBookingApi(opts: {
  apiBase: string;
  tenantKey: string;
}): BookingApiClient {
  async function call<T>(
    path: string,
    init: RequestInit
  ): Promise<T> {
    const res = await fetch(`${opts.apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Key": opts.tenantKey,
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw await toError(res);
    }
    return (await res.json()) as T;
  }

  return {
    async loadCatalog() {
      return await call("/api/v1/bookings/services", { method: "GET" });
    },
    async loadAvailability({ serviceId, fromUtc, toUtc }) {
      return await call("/api/v1/bookings/availability", {
        method: "POST",
        body: JSON.stringify({
          service_id: serviceId,
          from_utc: fromUtc,
          to_utc: toUtc,
        }),
      });
    },
    async createBooking({ serviceId, slotStartUtc, contact, locale }) {
      const res = await call<{ booking_id: string }>("/api/v1/bookings/create", {
        method: "POST",
        body: JSON.stringify({
          service_id: serviceId,
          slot_start_utc: slotStartUtc,
          contact,
          locale,
        }),
      });
      return { bookingId: res.booking_id };
    },
  };
}
