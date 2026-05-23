// Tipos compartidos del sistema de reservas.

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type TokenScope = 'confirm' | 'cancel' | 'manage';
export type CancelledBy =
  | 'customer'
  | 'business'
  | 'expired'
  | 'rescheduled'
  | 'slot_taken_by_another';
export type TenantStatus = 'active' | 'paused' | 'archived';
export type SanityMatchType = 'document_id' | 'document_type';

export type LocaleString = { es: string; en?: string };

export interface BookingTenant {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  default_locale: string;
  requires_approval: boolean;
  cancellation_policy: LocaleString;
  contact_email: string;
  contact_phone: string | null;
  branding_logo_url: string | null;
  branding_color_primary: string | null;
  allowed_origins: string[];
  status: TenantStatus;
  monthly_booking_limit: number;
  reminder_hours_before: number;
  cancel_cutoff_hours: number | null;
  reschedule_cutoff_hours: number | null;
  max_reschedules_per_booking: number;
  pending_expires_in_minutes: number;
  min_minutes_to_slot: number;
}

export interface BookingService {
  id: string;
  booking_tenant_id: string;
  sanity_document_id: string;
  name: LocaleString;
  description: LocaleString;
  duration_min: number;
  buffer_before_min: number;
  buffer_after_min: number;
  price_cents: number | null;
  currency: string;
  color: string | null;
  active: boolean;
  sort_order: number;
}

export interface Slot {
  start: string; // ISO 8601 UTC
  end: string;   // ISO 8601 UTC
}

export interface Booking {
  id: string;
  booking_tenant_id: string;
  service_id: string;
  slot_start_utc: string;
  slot_end_utc: string;
  status: BookingStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  notes: string | null;
  locale: string;
  ical_uid: string;
  reminder_sent_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: CancelledBy | null;
  cancellation_reason: string | null;
  pending_expires_at: string | null;
  replaces_booking_id: string | null;
  reschedule_count: number;
  created_at: string;
  updated_at: string;
}
