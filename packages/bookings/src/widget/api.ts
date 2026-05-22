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
      let code = "unknown";
      let message = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as {
          error?: { code?: string; message?: string };
        };
        code = body.error?.code ?? code;
        message = body.error?.message ?? message;
      } catch {}
      throw new BookingApiError(code, res.status, message);
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
