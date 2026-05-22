import type { Slot } from "../types";

/**
 * Calcula slots disponibles para un servicio en un rango.
 *
 * Algoritmo (single-resource V1):
 *  1. Para cada día del rango:
 *     - Obtener tramos del weekly_schedule del día (filtrado por weekday).
 *     - Aplicar overrides:
 *       · kind=closed sin tramo → quita el día entero.
 *       · kind=closed con tramo → quita ese sub-tramo.
 *       · kind=extra → añade un tramo nuevo.
 *     - Resultado: array de "windows" abiertas ese día (en la timezone del tenant).
 *  2. En cada window, generar candidate slots en pasos de `slotStepMin` minutos
 *     (default = service.duration_min).
 *  3. Quitar slots que solapen con bookings existentes (pending/confirmed) o
 *     con sus buffers.
 *  4. Convertir cada slot {start, end} de zona del tenant a UTC.
 *
 * Lib externa: usamos `Intl.DateTimeFormat` y aritmética manual sobre UTC para
 * evitar añadir luxon/date-fns-tz como dependencia. Suficiente para tenants con
 * timezone "Europe/Madrid" (DST manejado por Intl).
 */

export interface WeeklyTramo {
  weekday: number; // 0=domingo … 6=sábado
  start_time: string; // "HH:MM:SS"
  end_time: string;
}

export interface Override {
  override_date: string; // "YYYY-MM-DD"
  kind: "closed" | "extra";
  start_time: string | null;
  end_time: string | null;
}

export interface OccupiedRange {
  start_utc: string; // ISO
  end_utc: string;
}

export interface CalculateSlotsArgs {
  timezone: string;
  fromUtc: Date;
  toUtc: Date;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  weeklySchedule: WeeklyTramo[];
  overrides: Override[];
  occupied: OccupiedRange[];
  /** Paso entre slots candidatos en minutos. Default = durationMin. */
  slotStepMin?: number;
  /** No proponer slots que empiecen antes de esta hora UTC. Default = now. */
  notBeforeUtc?: Date;
}

interface Window {
  startUtc: number; // ms epoch
  endUtc: number;
}

export function calculateSlots(args: CalculateSlotsArgs): Slot[] {
  const stepMin = args.slotStepMin ?? args.durationMin;
  const notBeforeMs = (args.notBeforeUtc ?? new Date()).getTime();
  const fromMs = args.fromUtc.getTime();
  const toMs = args.toUtc.getTime();

  // Itera por cada día tocado por el rango (en la zona del tenant).
  const dates = enumerateDaysInZone({
    fromUtc: args.fromUtc,
    toUtc: args.toUtc,
    timezone: args.timezone,
  });

  const windows: Window[] = [];
  for (const dateStr of dates) {
    const weekday = weekdayInZone(dateStr, args.timezone);
    const weeklyTramos = args.weeklySchedule.filter(
      (w) => w.weekday === weekday
    );
    const dayOverrides = args.overrides.filter(
      (o) => o.override_date === dateStr
    );

    // Tramos del día = tramos semanales menos tramos cerrados, más tramos extra.
    let dayWindows: Array<{ start: string; end: string }> = weeklyTramos.map(
      (w) => ({ start: w.start_time.slice(0, 5), end: w.end_time.slice(0, 5) })
    );

    for (const ov of dayOverrides) {
      if (ov.kind === "closed") {
        if (!ov.start_time || !ov.end_time) {
          // Día entero cerrado.
          dayWindows = [];
        } else {
          dayWindows = subtractRange(dayWindows, {
            start: ov.start_time.slice(0, 5),
            end: ov.end_time.slice(0, 5),
          });
        }
      } else if (ov.kind === "extra") {
        if (ov.start_time && ov.end_time) {
          dayWindows.push({
            start: ov.start_time.slice(0, 5),
            end: ov.end_time.slice(0, 5),
          });
        }
      }
    }

    for (const w of dayWindows) {
      const startUtc = zonedTimeToUtc(dateStr, w.start, args.timezone);
      const endUtc = zonedTimeToUtc(dateStr, w.end, args.timezone);
      if (endUtc > startUtc) {
        windows.push({ startUtc, endUtc });
      }
    }
  }

  windows.sort((a, b) => a.startUtc - b.startUtc);

  // Genera slots candidatos en cada window.
  const durationMs = args.durationMin * 60_000;
  const stepMs = stepMin * 60_000;
  const bufBefore = args.bufferBeforeMin * 60_000;
  const bufAfter = args.bufferAfterMin * 60_000;

  const candidates: Slot[] = [];
  for (const win of windows) {
    let cur = win.startUtc;
    while (cur + durationMs <= win.endUtc) {
      if (cur >= fromMs && cur + durationMs <= toMs && cur >= notBeforeMs) {
        const candidateStart = cur;
        const candidateEnd = cur + durationMs;
        const overlaps = args.occupied.some((occ) => {
          const occStart = new Date(occ.start_utc).getTime() - bufBefore;
          const occEnd = new Date(occ.end_utc).getTime() + bufAfter;
          return candidateStart < occEnd && candidateEnd > occStart;
        });
        if (!overlaps) {
          candidates.push({
            start: new Date(candidateStart).toISOString(),
            end: new Date(candidateEnd).toISOString(),
          });
        }
      }
      cur += stepMs;
    }
  }

  return candidates;
}

// --------------------------------------------------------------------------
// Timezone helpers — sin dependencias externas, usando Intl.DateTimeFormat.
// --------------------------------------------------------------------------

/**
 * Lista las fechas YYYY-MM-DD que toca el rango [fromUtc, toUtc] en la zona dada.
 */
function enumerateDaysInZone(args: {
  fromUtc: Date;
  toUtc: Date;
  timezone: string;
}): string[] {
  const dates: string[] = [];
  // Avanzar día a día desde el primer día (en zona) hasta el último.
  const first = formatDateInZone(args.fromUtc, args.timezone);
  const last = formatDateInZone(args.toUtc, args.timezone);

  let [y, m, d] = first.split("-").map(Number);
  const [ly, lm, ld] = last.split("-").map(Number);

  // Loop seguro hasta llegar a (ly,lm,ld). Máx 366 días.
  for (let i = 0; i < 400; i++) {
    const ds = `${pad(y)}-${pad(m)}-${pad(d)}`;
    dates.push(ds);
    if (y === ly && m === lm && d === ld) break;
    // Incrementar fecha calendario.
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    y = next.getUTCFullYear();
    m = next.getUTCMonth() + 1;
    d = next.getUTCDate();
  }
  return dates;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDateInZone(date: Date, timezone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date); // "YYYY-MM-DD"
}

function weekdayInZone(dateStr: string, timezone: string): number {
  // Toma mediodía UTC de la fecha — evita ambigüedad en bordes de zona.
  const [y, m, d] = dateStr.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(noonUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

/**
 * Dado "2026-05-22" + "10:00" + "Europe/Madrid", devuelve el ms UTC equivalente.
 * Resuelve DST iterando: prueba dos offsets posibles del día.
 */
function zonedTimeToUtc(
  dateStr: string,
  timeHHMM: string,
  timezone: string
): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeHHMM.split(":").map(Number);

  // Approx UTC: asumir la fecha y hora son UTC, calcular offset, ajustar.
  const naiveUtc = Date.UTC(y, m - 1, d, h, mi);
  const offset1 = tzOffsetMs(new Date(naiveUtc), timezone);
  const candidate1 = naiveUtc - offset1;
  // Ajuste DST: recalcular offset en el candidate y reajustar si difiere.
  const offset2 = tzOffsetMs(new Date(candidate1), timezone);
  return naiveUtc - offset2;
}

function tzOffsetMs(date: Date, timezone: string): number {
  // Trick: formatear date en zona y restar de UTC.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  let hour = get("hour");
  if (hour === 24) hour = 0;
  const zonedAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second")
  );
  return zonedAsUtc - date.getTime();
}

function subtractRange(
  windows: Array<{ start: string; end: string }>,
  cut: { start: string; end: string }
): Array<{ start: string; end: string }> {
  const out: Array<{ start: string; end: string }> = [];
  for (const w of windows) {
    if (cut.end <= w.start || cut.start >= w.end) {
      out.push(w);
      continue;
    }
    if (cut.start > w.start) {
      out.push({ start: w.start, end: cut.start });
    }
    if (cut.end < w.end) {
      out.push({ start: cut.end, end: w.end });
    }
  }
  return out;
}
