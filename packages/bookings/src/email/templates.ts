/**
 * Plantillas HTML + texto para los emails de reservas. Bilingüe ES/EN.
 *
 * Estilo: inline CSS minimalista (max-width 560, system font), color primario
 * del tenant si está definido. Sin tracking pixels, sin imágenes externas.
 */

import type { BookingTenant } from "../types";

export interface BookingEmailVars {
  tenant: BookingTenant;
  contactName: string;
  serviceName: string;
  durationMin: number;
  slotStartLocal: string; // ya formateado en zona del tenant
  cancellationPolicy?: string;
  confirmUrl?: string;
  cancelUrl?: string;
  cancellationReason?: string;
  /** Origen del subdominio de bookings, ej. https://bookings.ebecerra.es. */
  bookingsOrigin: string;
}

type Locale = "es" | "en";

interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

// ============================================================
// PENDING — reserva creada, falta confirmar
// ============================================================
export function buildPendingEmail(
  vars: BookingEmailVars,
  locale: Locale
): BuiltEmail {
  const t = strings[locale];
  const subject = t.pending.subject(vars);
  const intro = t.pending.intro(vars);
  const cta = t.pending.confirm;
  const note = t.pending.note;
  const cancelLine = t.pending.cancelLine;

  const html = layout({
    title: subject,
    accent: vars.tenant.branding_color_primary ?? "#047857",
    body: `
      <p>${intro}</p>
      ${detailBlock(vars, locale)}
      <p>${note}</p>
      <p style="margin: 2rem 0;">
        <a href="${vars.confirmUrl}" style="display:inline-block; background:${
          vars.tenant.branding_color_primary ?? "#047857"
        }; color:#fff; padding:14px 24px; border-radius:6px; text-decoration:none; font-weight:600;">${cta}</a>
      </p>
      <p style="font-size: 0.92rem; color: #555;">${cancelLine} <a href="${vars.cancelUrl}">${t.pending.cancelLink}</a></p>
      ${policyBlock(vars, locale)}
    `,
    footer: t.footer(vars),
  });

  const text = [
    intro,
    "",
    plainDetails(vars, locale),
    "",
    note,
    "",
    `${cta}: ${vars.confirmUrl}`,
    `${cancelLine} ${vars.cancelUrl}`,
  ].join("\n");

  return { subject, html, text };
}

// ============================================================
// CONFIRMED — reserva confirmada, .ics adjunto
// ============================================================
export function buildConfirmedEmail(
  vars: BookingEmailVars,
  locale: Locale
): BuiltEmail {
  const t = strings[locale];
  const subject = t.confirmed.subject(vars);
  const intro = t.confirmed.intro(vars);

  const html = layout({
    title: subject,
    accent: vars.tenant.branding_color_primary ?? "#047857",
    body: `
      <p>${intro}</p>
      ${detailBlock(vars, locale)}
      <p>${t.confirmed.ics}</p>
      <p style="font-size: 0.92rem; color: #555;">${t.confirmed.cancelLine} <a href="${vars.cancelUrl}">${t.confirmed.cancelLink}</a></p>
      ${policyBlock(vars, locale)}
    `,
    footer: t.footer(vars),
  });

  const text = [
    intro,
    "",
    plainDetails(vars, locale),
    "",
    t.confirmed.ics,
    `${t.confirmed.cancelLine} ${vars.cancelUrl}`,
  ].join("\n");

  return { subject, html, text };
}

// ============================================================
// REMINDER — 24h antes
// ============================================================
export function buildReminderEmail(
  vars: BookingEmailVars,
  locale: Locale
): BuiltEmail {
  const t = strings[locale];
  const subject = t.reminder.subject(vars);
  const intro = t.reminder.intro(vars);

  const html = layout({
    title: subject,
    accent: vars.tenant.branding_color_primary ?? "#047857",
    body: `
      <p>${intro}</p>
      ${detailBlock(vars, locale)}
      <p style="font-size: 0.92rem; color: #555;">${t.reminder.cancelLine} <a href="${vars.cancelUrl}">${t.reminder.cancelLink}</a></p>
    `,
    footer: t.footer(vars),
  });

  const text = [intro, "", plainDetails(vars, locale)].join("\n");
  return { subject, html, text };
}

// ============================================================
// CANCELLED
// ============================================================
export function buildCancelledEmail(
  vars: BookingEmailVars,
  locale: Locale
): BuiltEmail {
  const t = strings[locale];
  const subject = t.cancelled.subject(vars);
  const intro = t.cancelled.intro(vars);

  const reasonLine = vars.cancellationReason
    ? `<p><em>${t.cancelled.reasonLabel}:</em> ${escape(vars.cancellationReason)}</p>`
    : "";

  const html = layout({
    title: subject,
    accent: "#b45309",
    body: `
      <p>${intro}</p>
      ${detailBlock(vars, locale)}
      ${reasonLine}
      <p>${t.cancelled.outro}</p>
    `,
    footer: t.footer(vars),
  });

  const text = [intro, "", plainDetails(vars, locale), "", t.cancelled.outro].join(
    "\n"
  );
  return { subject, html, text };
}

// ============================================================
// helpers
// ============================================================
function layout(args: {
  title: string;
  accent: string;
  body: string;
  footer: string;
}): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escape(args.title)}</title>
</head>
<body style="margin:0; background:#f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px;">
    <div style="background:#fff; padding: 32px; border-radius: 8px; color:#1a1a1a; line-height:1.55;">
      <h1 style="font-size: 1.4rem; margin: 0 0 1rem; color: ${args.accent};">${escape(args.title)}</h1>
      ${args.body}
    </div>
    <p style="margin: 1.5rem 0 0; font-size: 0.82rem; color: #888; text-align:center;">${args.footer}</p>
  </div>
</body>
</html>`;
}

function detailBlock(vars: BookingEmailVars, locale: Locale): string {
  const t = strings[locale].labels;
  return `<table style="margin: 1rem 0; border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0; color:#555;">${t.service}</td><td style="padding: 4px 0;"><strong>${escape(vars.serviceName)}</strong></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color:#555;">${t.duration}</td><td style="padding: 4px 0;"><strong>${vars.durationMin} min</strong></td></tr>
    <tr><td style="padding: 4px 12px 4px 0; color:#555;">${t.date}</td><td style="padding: 4px 0;"><strong>${escape(vars.slotStartLocal)}</strong></td></tr>
  </table>`;
}

function plainDetails(vars: BookingEmailVars, locale: Locale): string {
  const t = strings[locale].labels;
  return [
    `${t.service}: ${vars.serviceName}`,
    `${t.duration}: ${vars.durationMin} min`,
    `${t.date}: ${vars.slotStartLocal}`,
  ].join("\n");
}

function policyBlock(vars: BookingEmailVars, locale: Locale): string {
  if (!vars.cancellationPolicy) return "";
  const t = strings[locale];
  return `<hr style="border:none; border-top:1px solid #eee; margin: 1.5rem 0;">
  <p style="font-size: 0.9rem; color:#555;"><strong>${t.policy}:</strong> ${escape(vars.cancellationPolicy)}</p>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// i18n strings
// ============================================================
const strings = {
  es: {
    labels: { service: "Servicio", duration: "Duración", date: "Fecha y hora" },
    policy: "Política de cancelación",
    footer: (v: BookingEmailVars) =>
      `Reservas gestionadas por ${escape(v.tenant.name)} · ${escape(v.bookingsOrigin)}`,
    pending: {
      subject: (v: BookingEmailVars) =>
        `Confirma tu cita con ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hola ${escape(v.contactName)}, hemos recibido tu solicitud de reserva. Para confirmarla, haz click en el botón:`,
      note: "Si no confirmas en los próximos 7 días, la cita se elimina automáticamente.",
      confirm: "Confirmar cita",
      cancelLine: "¿No es lo que querías?",
      cancelLink: "Cancelar esta reserva",
    },
    confirmed: {
      subject: (v: BookingEmailVars) => `Cita confirmada con ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hola ${escape(v.contactName)}, tu cita está confirmada. Adjuntamos un archivo .ics que puedes añadir a tu calendario.`,
      ics: "Te enviaremos un recordatorio antes de la cita.",
      cancelLine: "Si no vas a poder ir, cancela cuanto antes:",
      cancelLink: "Cancelar esta cita",
    },
    reminder: {
      subject: (v: BookingEmailVars) =>
        `Recordatorio: cita mañana con ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hola ${escape(v.contactName)}, te recordamos tu próxima cita:`,
      cancelLine: "¿No vas a poder?",
      cancelLink: "Cancelar la cita",
    },
    cancelled: {
      subject: (v: BookingEmailVars) =>
        `Cita cancelada con ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hola ${escape(v.contactName)}, tu cita ha sido cancelada:`,
      reasonLabel: "Motivo",
      outro: "Si quieres reservar otra fecha, vuelve a la web cuando quieras.",
    },
  },
  en: {
    labels: { service: "Service", duration: "Duration", date: "Date & time" },
    policy: "Cancellation policy",
    footer: (v: BookingEmailVars) =>
      `Bookings managed by ${escape(v.tenant.name)} · ${escape(v.bookingsOrigin)}`,
    pending: {
      subject: (v: BookingEmailVars) =>
        `Confirm your booking with ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hi ${escape(v.contactName)}, we received your booking request. To confirm, click the button below:`,
      note: "If you don't confirm within 7 days, the booking is automatically deleted.",
      confirm: "Confirm booking",
      cancelLine: "Not what you wanted?",
      cancelLink: "Cancel this booking",
    },
    confirmed: {
      subject: (v: BookingEmailVars) => `Booking confirmed with ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hi ${escape(v.contactName)}, your booking is confirmed. We've attached an .ics file you can add to your calendar.`,
      ics: "We'll send you a reminder before the appointment.",
      cancelLine: "If you can't make it, please cancel asap:",
      cancelLink: "Cancel this booking",
    },
    reminder: {
      subject: (v: BookingEmailVars) =>
        `Reminder: appointment tomorrow with ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hi ${escape(v.contactName)}, just a reminder of your upcoming appointment:`,
      cancelLine: "Can't make it?",
      cancelLink: "Cancel the booking",
    },
    cancelled: {
      subject: (v: BookingEmailVars) =>
        `Booking cancelled with ${v.tenant.name}`,
      intro: (v: BookingEmailVars) =>
        `Hi ${escape(v.contactName)}, your booking has been cancelled:`,
      reasonLabel: "Reason",
      outro: "If you'd like to book another date, come back to the site whenever.",
    },
  },
} as const;
