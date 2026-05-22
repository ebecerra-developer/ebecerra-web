/**
 * Generador mínimo de archivos .ics (RFC 5545) para citas.
 *
 * Solo soporta VEVENT con UID estable, DTSTART/DTEND UTC, SUMMARY, DESCRIPTION,
 * LOCATION opcional. Suficiente para que Google Calendar, Outlook, Apple Calendar
 * y la mayoría de clientes web/móviles importen la cita correctamente.
 */

export interface IcsEventInput {
  uid: string;
  startUtc: Date;
  endUtc: Date;
  summary: string;
  description?: string;
  location?: string;
  organizerEmail?: string;
  organizerName?: string;
  attendeeEmail?: string;
  attendeeName?: string;
}

export function buildIcs(event: IcsEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ebecerra.es//Reservas//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatUtcCompact(new Date())}`,
    `DTSTART:${formatUtcCompact(event.startUtc)}`,
    `DTEND:${formatUtcCompact(event.endUtc)}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  if (event.organizerEmail) {
    const cn = event.organizerName
      ? `;CN=${escapeText(event.organizerName)}`
      : "";
    lines.push(`ORGANIZER${cn}:mailto:${event.organizerEmail}`);
  }
  if (event.attendeeEmail) {
    const cn = event.attendeeName
      ? `;CN=${escapeText(event.attendeeName)}`
      : "";
    lines.push(
      `ATTENDEE${cn};RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:${event.attendeeEmail}`
    );
  }
  lines.push("STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR");
  // RFC 5545 requiere CRLF.
  return lines.join("\r\n") + "\r\n";
}

function formatUtcCompact(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
