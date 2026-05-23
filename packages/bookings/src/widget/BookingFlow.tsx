"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import css from "./BookingFlow.module.css";
import {
  createBookingApi,
  createRescheduleApi,
  BookingApiError,
  type BookingApiClient,
  type RescheduleApiClient,
} from "./api";
import {
  DEFAULT_STRINGS,
  type WidgetService,
  type WidgetSlot,
  type WidgetStrings,
  type WidgetTenant,
} from "./types";

export interface BookingFlowProps {
  /** Endpoint base, ej. `https://bookings.ebecerra.es`. */
  apiBase: string;
  /** Clave pública del tenant (BOOKING_TENANT_KEY raw). Solo necesaria en mode='create'. */
  tenantKey: string;
  /** Locale del visitante. Default 'es'. */
  locale?: "es" | "en";
  /** Override de strings. */
  strings?: Partial<WidgetStrings>;
  /** Color acento override (sobrescribe el del tenant). */
  accentColor?: string;
  /**
   * Modo del widget:
   * - 'create' (default): flujo completo nueva reserva, requiere tenantKey.
   * - 'reschedule': flujo reagendado, requiere rescheduleContext. Salta Step 4 (contacto).
   */
  mode?: "create" | "reschedule";
  /** Contexto requerido cuando mode='reschedule'. */
  rescheduleContext?: {
    bookingId: string;
    rawToken: string;
    currentServiceId: string;
    tenantSlug: string;
    tenantTimezone: string;
  };
  /** Callback tras reagendar OK. */
  onRescheduled?: (newBookingId: string, newManageToken: string) => void;
}

type Step = 1 | 2 | 3 | 4 | "success";

interface State {
  step: Step;
  service: WidgetService | null;
  day: string | null; // "YYYY-MM-DD" en zona del tenant
  slot: WidgetSlot | null;
  monthStart: Date; // primer día del mes mostrado, UTC
  error: string | null;
}

type Action =
  | { type: "select-service"; service: WidgetService }
  | { type: "select-day"; day: string }
  | { type: "select-slot"; slot: WidgetSlot }
  | { type: "back" }
  | { type: "change-month"; monthStart: Date }
  | { type: "set-error"; error: string | null }
  | { type: "success" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select-service":
      return { ...state, step: 2, service: action.service, day: null, slot: null };
    case "select-day":
      return { ...state, step: 3, day: action.day, slot: null };
    case "select-slot":
      return { ...state, step: 4, slot: action.slot };
    case "back": {
      if (state.step === 2) return { ...state, step: 1, service: null };
      if (state.step === 3) return { ...state, step: 2, day: null };
      if (state.step === 4) return { ...state, step: 3, slot: null };
      return state;
    }
    case "change-month":
      return { ...state, monthStart: action.monthStart };
    case "set-error":
      return { ...state, error: action.error };
    case "success":
      return { ...state, step: "success" };
  }
}

const initialState = (): State => ({
  step: 1,
  service: null,
  day: null,
  slot: null,
  monthStart: firstOfMonthUtc(new Date()),
  error: null,
});

export function BookingFlow(props: BookingFlowProps) {
  const locale = props.locale ?? "es";
  const mode = props.mode ?? "create";
  const strings = useMemo<WidgetStrings>(
    () => ({ ...DEFAULT_STRINGS[locale], ...props.strings }),
    [locale, props.strings]
  );

  const api = useMemo<BookingApiClient | null>(
    () =>
      mode === "create"
        ? createBookingApi({ apiBase: props.apiBase, tenantKey: props.tenantKey })
        : null,
    [props.apiBase, props.tenantKey, mode]
  );

  const reschedApi = useMemo<RescheduleApiClient | null>(() => {
    if (mode !== "reschedule" || !props.rescheduleContext) return null;
    return createRescheduleApi({
      apiBase: props.apiBase,
      rawToken: props.rescheduleContext.rawToken,
      bookingId: props.rescheduleContext.bookingId,
    });
  }, [props.apiBase, props.rescheduleContext, mode]);

  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [catalog, setCatalog] = useState<{
    tenant: WidgetTenant;
    services: WidgetService[];
  } | null>(null);
  const [slotsByDay, setSlotsByDay] = useState<Map<string, WidgetSlot[]> | null>(
    null
  );
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Scroll al inicio cuando cambia de step. Si el widget está embebido en una
  // sección con heading propio (caso típico: demo equilibrio "Reserva tu sesión"),
  // preferimos scrollear al heading de la sección para mantener contexto. Si no,
  // scrolleamos al root con scroll-margin-top para dejar aire arriba.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const section = root.closest("section");
    const sectionHeading = section?.querySelector("h1, h2") as HTMLElement | null;
    const target = sectionHeading ?? root;
    // Aseguramos un offset visual por si hay nav sticky en el host
    const prev = target.style.scrollMarginTop;
    target.style.scrollMarginTop = sectionHeading ? "24px" : "80px";
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Restauramos tras la animación (smooth scroll ≈ 400ms)
    const t = window.setTimeout(() => {
      target.style.scrollMarginTop = prev;
    }, 600);
    return () => window.clearTimeout(t);
  }, [state.step]);

  // Catalog
  useEffect(() => {
    const loader = api ?? reschedApi;
    if (!loader) return;
    let cancelled = false;
    loader
      .loadCatalog()
      .then((c) => {
        if (cancelled) return;
        setCatalog(c);
        // En reschedule preseleccionamos el servicio actual y arrancamos en step 2.
        if (mode === "reschedule" && props.rescheduleContext) {
          const current = c.services.find(
            (s) => s.id === props.rescheduleContext!.currentServiceId
          );
          if (current) {
            dispatch({ type: "select-service", service: current });
          }
        }
      })
      .catch((e) => {
        if (!cancelled)
          dispatch({
            type: "set-error",
            error: errorMessage(e, strings),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [api, reschedApi, strings, mode, props.rescheduleContext]);

  // Availability del mes cuando hay servicio + mes
  useEffect(() => {
    if (!state.service || !catalog) return;
    setLoadingAvail(true);
    const fromUtc = new Date(state.monthStart).toISOString();
    const toUtc = endOfMonthUtc(state.monthStart).toISOString();
    let cancelled = false;
    const loader = api ?? reschedApi;
    if (!loader) return;
    loader
      .loadAvailability({
        serviceId: state.service.id,
        fromUtc,
        toUtc,
      })
      .then((res) => {
        if (cancelled) return;
        const map = new Map<string, WidgetSlot[]>();
        for (const slot of res.slots) {
          const day = dayInZone(slot.start, catalog.tenant.timezone);
          const arr = map.get(day) ?? [];
          arr.push(slot);
          map.set(day, arr);
        }
        setSlotsByDay(map);
        setLoadingAvail(false);
      })
      .catch((e) => {
        if (!cancelled) {
          dispatch({ type: "set-error", error: errorMessage(e, strings) });
          setLoadingAvail(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [api, reschedApi, state.service, state.monthStart, catalog, strings]);

  const accentVar: React.CSSProperties = {
    ["--bookings-accent" as string]:
      props.accentColor ?? catalog?.tenant.branding_color_primary ?? "#047857",
  };

  if (!catalog) {
    return (
      <div ref={rootRef} className={css.root} style={accentVar}>
        {state.error ? (
          <p className={css.error} role="alert">
            {state.error}
          </p>
        ) : (
          <p>{strings.step2Loading}</p>
        )}
      </div>
    );
  }

  if (state.step === "success") {
    return (
      <div ref={rootRef} className={css.root} style={accentVar}>
        <div className={css.success}>
          <h2>{strings.successTitle}</h2>
          <p>{strings.successBody}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={css.root} style={accentVar}>
      <div className={css.steps} aria-hidden>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`${css.step} ${
              (state.step as number) >= n ? css.stepActive : ""
            }`}
          />
        ))}
      </div>

      <div className={css.header}>
        {state.step !== 1 && (
          <button
            className={css.backBtn}
            type="button"
            onClick={() => dispatch({ type: "back" })}
          >
            ← {strings.back}
          </button>
        )}
        <h2 className={css.stepTitle}>{titleFor(state.step, strings)}</h2>
      </div>

      {state.step === 1 && (
        <Step1Services
          services={catalog.services}
          locale={locale}
          strings={strings}
          onSelect={(service) => dispatch({ type: "select-service", service })}
        />
      )}

      {state.step === 2 && state.service && (
        <Step2Calendar
          tenant={catalog.tenant}
          monthStart={state.monthStart}
          slotsByDay={slotsByDay}
          loading={loadingAvail}
          strings={strings}
          locale={locale}
          onPickDay={(day) => dispatch({ type: "select-day", day })}
          onChangeMonth={(monthStart) =>
            dispatch({ type: "change-month", monthStart })
          }
        />
      )}

      {state.step === 3 && state.day && (
        <Step3Slots
          day={state.day}
          slots={slotsByDay?.get(state.day) ?? []}
          tenant={catalog.tenant}
          locale={locale}
          strings={strings}
          onPickSlot={(slot) => {
            if (mode === "reschedule" && reschedApi && state.service) {
              dispatch({ type: "select-slot", slot });
              reschedApi
                .reschedule({
                  newSlotStartUtc: slot.start,
                  newServiceId: state.service.id,
                })
                .then((r) => {
                  props.onRescheduled?.(r.newBookingId, r.newManageToken);
                })
                .catch((e) => {
                  dispatch({ type: "set-error", error: errorMessage(e, strings) });
                });
            } else {
              dispatch({ type: "select-slot", slot });
            }
          }}
        />
      )}

      {mode === "create" && state.step === 4 && state.slot && state.service && api && (
        <Step4Contact
          service={state.service}
          slot={state.slot}
          tenant={catalog.tenant}
          locale={locale}
          strings={strings}
          api={api}
          onError={(error) => dispatch({ type: "set-error", error })}
          onSuccess={() => dispatch({ type: "success" })}
        />
      )}

      {state.error && (
        <p className={css.error} role="alert">
          {state.error}
        </p>
      )}

      {state.step === 1 && catalog.tenant.cancellation_policy && (
        <p className={css.policy}>
          <strong>{strings.policyLabel}:</strong>{" "}
          {pickLocaleString(catalog.tenant.cancellation_policy, locale)}
        </p>
      )}
    </div>
  );
}

// ---------- Step components ----------

function Step1Services({
  services,
  locale,
  strings,
  onSelect,
}: {
  services: WidgetService[];
  locale: "es" | "en";
  strings: WidgetStrings;
  onSelect: (s: WidgetService) => void;
}) {
  if (services.length === 0) return <p>{strings.step1Empty}</p>;
  return (
    <div className={css.serviceList}>
      {services.map((s) => (
        <button
          key={s.id}
          type="button"
          className={css.serviceCard}
          onClick={() => onSelect(s)}
        >
          <h3>{pickLocaleString(s.name, locale)}</h3>
          {pickLocaleString(s.description, locale) && (
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.92rem", color: "#555" }}>
              {pickLocaleString(s.description, locale)}
            </p>
          )}
          <div className={css.serviceMeta}>
            <span>
              {s.duration_min} {strings.durationMin}
            </span>
            {typeof s.price_cents === "number" && (
              <span className={css.servicePrice}>
                {formatPrice(s.price_cents, s.currency, locale)}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function Step2Calendar({
  tenant,
  monthStart,
  slotsByDay,
  loading,
  strings,
  locale,
  onPickDay,
  onChangeMonth,
}: {
  tenant: WidgetTenant;
  monthStart: Date;
  slotsByDay: Map<string, WidgetSlot[]> | null;
  loading: boolean;
  strings: WidgetStrings;
  locale: "es" | "en";
  onPickDay: (day: string) => void;
  onChangeMonth: (start: Date) => void;
}) {
  const today = new Date();
  const thisMonthStart = firstOfMonthUtc(today);
  const canGoBack = monthStart.getTime() > thisMonthStart.getTime();

  const monthLabel = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "es-ES",
    { month: "long", year: "numeric" }
  ).format(monthStart);

  const dayLabels =
    locale === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["L", "M", "X", "J", "V", "S", "D"];

  // Días del mes
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Día de la semana del 1 (0=Sun) → ajustar a Mon-first
  const firstWeekday = new Date(year, month, 1).getDay();
  const offset = (firstWeekday + 6) % 7; // Mon=0

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${pad(month + 1)}-${pad(d)}`;
    cells.push({ day: d, dateStr: ds });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateStr: null });

  const todayDateStr = dayInZone(today.toISOString(), tenant.timezone);

  return (
    <div className={css.calendarWrap}>
      <div className={css.calendarNav}>
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={!canGoBack}
          onClick={() => {
            const prev = new Date(monthStart);
            prev.setUTCMonth(prev.getUTCMonth() - 1);
            onChangeMonth(prev);
          }}
        >
          ←
        </button>
        <strong style={{ textTransform: "capitalize" }}>{monthLabel}</strong>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => {
            const next = new Date(monthStart);
            next.setUTCMonth(next.getUTCMonth() + 1);
            onChangeMonth(next);
          }}
        >
          →
        </button>
      </div>

      {loading ? (
        <p>{strings.step2Loading}</p>
      ) : (
        <div className={css.calendarGrid} role="grid">
          {dayLabels.map((l) => (
            <div key={l} className={css.dayLabel}>
              {l}
            </div>
          ))}
          {cells.map((c, i) => {
            if (!c.dateStr) {
              return <span key={i} className={`${css.dayCell} ${css.dayEmpty}`} />;
            }
            const hasSlots = (slotsByDay?.get(c.dateStr)?.length ?? 0) > 0;
            const isPast = c.dateStr < todayDateStr;
            const isToday = c.dateStr === todayDateStr;
            const classes = [
              css.dayCell,
              hasSlots ? css.dayHasSlots : "",
              isToday ? css.dayToday : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={i}
                type="button"
                className={classes}
                disabled={isPast || !hasSlots}
                aria-label={c.dateStr}
                onClick={() => onPickDay(c.dateStr!)}
              >
                {c.day}
              </button>
            );
          })}
        </div>
      )}

      {!loading && slotsByDay && slotsByDay.size === 0 && (
        <p style={{ marginTop: "1rem", color: "var(--muted)", textAlign: "center" }}>
          {strings.step2NoSlots}
        </p>
      )}
    </div>
  );
}

function Step3Slots({
  day,
  slots,
  tenant,
  locale,
  strings,
  onPickSlot,
}: {
  day: string;
  slots: WidgetSlot[];
  tenant: WidgetTenant;
  locale: "es" | "en";
  strings: WidgetStrings;
  onPickSlot: (s: WidgetSlot) => void;
}) {
  const morning: WidgetSlot[] = [];
  const afternoon: WidgetSlot[] = [];
  const evening: WidgetSlot[] = [];
  for (const s of slots) {
    const h = hourInZone(s.start, tenant.timezone);
    if (h < 13) morning.push(s);
    else if (h < 18) afternoon.push(s);
    else evening.push(s);
  }

  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    timeZone: tenant.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });

  const dayLabel = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "es-ES",
    { timeZone: tenant.timezone, weekday: "long", day: "numeric", month: "long" }
  ).format(new Date(slots[0]?.start ?? `${day}T12:00:00Z`));

  return (
    <>
      <p style={{ margin: "0 0 1rem", color: "#666", textTransform: "capitalize" }}>
        {dayLabel}
      </p>

      {[
        { title: strings.step3Morning, group: morning },
        { title: strings.step3Afternoon, group: afternoon },
        { title: strings.step3Evening, group: evening },
      ].map(
        (g) =>
          g.group.length > 0 && (
            <div key={g.title} className={css.slotsGroup}>
              <h3 className={css.slotsGroupTitle}>{g.title}</h3>
              <div className={css.slotsList}>
                {g.group.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    className={css.slotBtn}
                    onClick={() => onPickSlot(s)}
                  >
                    {fmt.format(new Date(s.start))}
                  </button>
                ))}
              </div>
            </div>
          )
      )}
    </>
  );
}

function Step4Contact({
  service,
  slot,
  tenant,
  locale,
  strings,
  api,
  onError,
  onSuccess,
}: {
  service: WidgetService;
  slot: WidgetSlot;
  tenant: WidgetTenant;
  locale: "es" | "en";
  strings: WidgetStrings;
  api: BookingApiClient;
  onError: (msg: string | null) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const slotLabel = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "es-ES",
    {
      timeZone: tenant.timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(slot.start));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      await api.createBooking({
        serviceId: service.id,
        slotStartUtc: slot.start,
        contact: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        locale,
      });
      onSuccess();
    } catch (e) {
      onError(errorMessage(e, strings));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className={css.summary}>
        <p style={{ margin: 0 }}>
          <strong>{strings.step3Title}:</strong> {slotLabel}
        </p>
        <p style={{ margin: "0.3rem 0 0" }}>
          <strong>{strings.step1Title}:</strong>{" "}
          {pickLocaleString(service.name, locale)} ({service.duration_min}{" "}
          {strings.durationMin})
        </p>
      </div>

      <form className={css.form} onSubmit={onSubmit}>
        <div className={css.field}>
          <label htmlFor="bk-name">{strings.step4Name}</label>
          <input
            id="bk-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
          />
        </div>
        <div className={css.field}>
          <label htmlFor="bk-email">{strings.step4Email}</label>
          <input
            id="bk-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className={css.field}>
          <label htmlFor="bk-phone">{strings.step4Phone}</label>
          <input
            id="bk-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div className={css.field}>
          <label htmlFor="bk-notes">{strings.step4Notes}</label>
          <textarea
            id="bk-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            rows={3}
          />
        </div>
        <button type="submit" className={css.submitBtn} disabled={submitting}>
          {submitting ? strings.step4Submitting : strings.step4Submit}
        </button>
      </form>
    </>
  );
}

// ---------- helpers ----------

function titleFor(step: Step, strings: WidgetStrings): string {
  switch (step) {
    case 1:
      return strings.step1Title;
    case 2:
      return strings.step2Title;
    case 3:
      return strings.step3Title;
    case 4:
      return strings.step4Title;
    default:
      return "";
  }
}

function pickLocaleString(
  v: unknown,
  locale: "es" | "en"
): string {
  if (!v || typeof v !== "object") return "";
  const obj = v as Record<string, unknown>;
  const val = obj[locale] ?? obj.es;
  return typeof val === "string" ? val : "";
}

function errorMessage(e: unknown, strings: WidgetStrings): string {
  if (e instanceof BookingApiError && e.code === "slot_taken") {
    return strings.errorSlotTaken;
  }
  return strings.errorGeneric;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function firstOfMonthUtc(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
}

function endOfMonthUtc(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59)
  );
}

function dayInZone(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function hourInZone(iso: string, timezone: string): number {
  const h = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  return Number(h);
}

function formatPrice(
  cents: number,
  currency: string,
  locale: "es" | "en"
): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
