import type { LocaleString } from "../types";

export interface WidgetService {
  id: string;
  name: LocaleString;
  description: LocaleString;
  duration_min: number;
  price_cents: number | null;
  currency: string;
  color: string | null;
}

export interface WidgetTenant {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  default_locale: string;
  branding_color_primary: string | null;
  cancellation_policy: LocaleString | null;
}

export interface WidgetSlot {
  start: string;
  end: string;
}

export interface WidgetStrings {
  step1Title: string;
  step1Empty: string;
  step2Title: string;
  step2Loading: string;
  step2NoSlots: string;
  step3Title: string;
  step3Morning: string;
  step3Afternoon: string;
  step3Evening: string;
  step4Title: string;
  step4Name: string;
  step4Email: string;
  step4Phone: string;
  step4Notes: string;
  step4Submit: string;
  step4Submitting: string;
  back: string;
  successTitle: string;
  successBody: string;
  errorGeneric: string;
  errorSlotTaken: string;
  durationMin: string;
  policyLabel: string;
}

export const DEFAULT_STRINGS: Record<"es" | "en", WidgetStrings> = {
  es: {
    step1Title: "Elige un servicio",
    step1Empty: "Sin servicios disponibles ahora mismo.",
    step2Title: "Elige día",
    step2Loading: "Cargando disponibilidad…",
    step2NoSlots: "Sin huecos disponibles este mes.",
    step3Title: "Elige hora",
    step3Morning: "Mañana",
    step3Afternoon: "Tarde",
    step3Evening: "Noche",
    step4Title: "Tus datos",
    step4Name: "Nombre",
    step4Email: "Email",
    step4Phone: "Teléfono (opcional)",
    step4Notes: "Notas (opcional)",
    step4Submit: "Reservar",
    step4Submitting: "Reservando…",
    back: "Atrás",
    successTitle: "Cita solicitada",
    successBody:
      "Te hemos enviado un email para confirmar la cita. Haz click en el enlace para finalizar la reserva.",
    errorGeneric: "Algo ha fallado. Inténtalo de nuevo en un momento.",
    errorSlotTaken: "Ese hueco se acaba de ocupar. Elige otro.",
    durationMin: "min",
    policyLabel: "Política de cancelación",
  },
  en: {
    step1Title: "Pick a service",
    step1Empty: "No services available right now.",
    step2Title: "Pick a day",
    step2Loading: "Loading availability…",
    step2NoSlots: "No slots available this month.",
    step3Title: "Pick a time",
    step3Morning: "Morning",
    step3Afternoon: "Afternoon",
    step3Evening: "Evening",
    step4Title: "Your details",
    step4Name: "Name",
    step4Email: "Email",
    step4Phone: "Phone (optional)",
    step4Notes: "Notes (optional)",
    step4Submit: "Book",
    step4Submitting: "Booking…",
    back: "Back",
    successTitle: "Booking requested",
    successBody:
      "We've sent you an email to confirm. Click the link to finalize your booking.",
    errorGeneric: "Something went wrong. Try again in a moment.",
    errorSlotTaken: "That slot was just taken. Pick another one.",
    durationMin: "min",
    policyLabel: "Cancellation policy",
  },
};
