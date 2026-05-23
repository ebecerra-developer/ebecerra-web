"use client";

import { useState } from "react";
import { BookingFlow } from "@ebecerra/bookings/widget";

interface Props {
  bookingId: string;
  rawToken: string;
  status: "pending" | "confirmed";
  locale: "es" | "en";
  tenantContactPhone: string | null;
  canCancel: boolean;
  canReschedule: boolean;
  cancelCutoffHours: number | null;
  rescheduleCutoffHours: number | null;
  remainingReschedules: number;
  tenantSlug: string;
  tenantTimezone: string;
  currentServiceId: string;
  bookingsApiBase: string;
  tenantBrandColor: string | null;
}

const t = {
  es: {
    confirm: "Confirmar mi cita",
    confirmHint: "Marca la reserva como confirmada y te llegará el .ics",
    reschedule: "Cambiar hora o servicio",
    rescheduleHint: "Elige un nuevo hueco. La cita actual se cancela.",
    cancel: "Cancelar la cita",
    cancelHint: "Liberas el hueco para otras personas.",
    cutoffCancel: (h: number) =>
      `Ya no se puede cancelar online (faltan menos de ${h}h).`,
    cutoffReschedule: (h: number) =>
      `Ya no se puede cambiar online (faltan menos de ${h}h).`,
    maxReschedules: "Has alcanzado el número máximo de cambios para esta cita.",
    callPhone: (p: string) => `Llama al negocio: ${p}`,
    reasonLabel: "¿Por qué cancelas? (opcional)",
    confirmCancel: "Sí, cancelar",
    keepBack: "Volver",
    submitting: "Procesando…",
    rescheduleTitle: "Elige un nuevo hueco",
    cancelTitle: "¿Seguro que quieres cancelar?",
    errorGeneric: "Algo ha fallado. Intenta de nuevo.",
  },
  en: {
    confirm: "Confirm my booking",
    confirmHint: "Marks the booking as confirmed and sends you the .ics",
    reschedule: "Change time or service",
    rescheduleHint: "Pick a new slot. The current booking is cancelled.",
    cancel: "Cancel the booking",
    cancelHint: "Free up the slot for others.",
    cutoffCancel: (h: number) =>
      `Cannot cancel online any more (less than ${h}h to go).`,
    cutoffReschedule: (h: number) =>
      `Cannot change online any more (less than ${h}h to go).`,
    maxReschedules: "You've reached the max changes for this booking.",
    callPhone: (p: string) => `Call the business: ${p}`,
    reasonLabel: "Why are you cancelling? (optional)",
    confirmCancel: "Yes, cancel",
    keepBack: "Back",
    submitting: "Processing…",
    rescheduleTitle: "Pick a new slot",
    cancelTitle: "Sure you want to cancel?",
    errorGeneric: "Something failed. Try again.",
  },
};

type Mode = "idle" | "rescheduling" | "cancelling" | "submitting";

export default function CitaActions(props: Props) {
  const L = t[props.locale];
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const accentStyle: React.CSSProperties = {
    ["--accent" as string]: props.tenantBrandColor ?? "#047857",
  };

  async function callAction(
    path: "confirm-from-manage" | "cancel-from-manage",
    body: Record<string, unknown> = {}
  ) {
    setMode("submitting");
    setError(null);
    try {
      const res = await fetch(`${props.bookingsApiBase}${"/api/v1/bookings/"}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: props.rawToken,
          booking_id: props.bookingId,
          ...body,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error?.message ?? L.errorGeneric);
        setMode("idle");
        return;
      }
      if (data.redirect_to) {
        window.location.href = data.redirect_to;
        return;
      }
      window.location.reload();
    } catch {
      setError(L.errorGeneric);
      setMode("idle");
    }
  }

  if (mode === "rescheduling") {
    return (
      <div className="cita-reschedule-section" style={accentStyle}>
        <h2 style={{ marginTop: 0 }}>{L.rescheduleTitle}</h2>
        <BookingFlow
          apiBase={props.bookingsApiBase}
          tenantKey="__manage_mode__"
          locale={props.locale}
          accentColor={props.tenantBrandColor ?? undefined}
          mode="reschedule"
          rescheduleContext={{
            bookingId: props.bookingId,
            rawToken: props.rawToken,
            currentServiceId: props.currentServiceId,
            tenantSlug: props.tenantSlug,
            tenantTimezone: props.tenantTimezone,
          }}
          onRescheduled={(newBookingId, newManageSignedToken) => {
            window.location.href = `${props.bookingsApiBase}/cita/${newBookingId}?token=${encodeURIComponent(newManageSignedToken)}`;
          }}
        />
        <p style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="cita-action-btn"
            style={{ width: "auto" }}
            onClick={() => setMode("idle")}
          >
            ← {L.keepBack}
          </button>
        </p>
      </div>
    );
  }

  if (mode === "cancelling" || mode === "submitting") {
    return (
      <form
        className="cita-cancel-form"
        style={accentStyle}
        onSubmit={(e) => {
          e.preventDefault();
          callAction("cancel-from-manage", { reason: reason.trim() || undefined });
        }}
      >
        <h2 style={{ marginTop: 0 }}>{L.cancelTitle}</h2>
        <label htmlFor="cancel-reason">{L.reasonLabel}</label>
        <textarea
          id="cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          disabled={mode === "submitting"}
        />
        {error && <p className="cita-error">{error}</p>}
        <div className="cita-cancel-form-buttons">
          <button
            type="button"
            onClick={() => setMode("idle")}
            disabled={mode === "submitting"}
          >
            {L.keepBack}
          </button>
          <button type="submit" disabled={mode === "submitting"}>
            {mode === "submitting" ? L.submitting : L.confirmCancel}
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="cita-actions" style={accentStyle}>
      {props.status === "pending" && (
        <button
          type="button"
          className="cita-action-btn cita-action-btn-primary"
          onClick={() => callAction("confirm-from-manage")}
          disabled={mode === "submitting" as Mode}
        >
          <span className="cita-action-title">{L.confirm}</span>
          <span className="cita-action-hint">{L.confirmHint}</span>
        </button>
      )}

      {props.canReschedule ? (
        <button
          type="button"
          className="cita-action-btn"
          onClick={() => setMode("rescheduling")}
        >
          <span className="cita-action-title">{L.reschedule}</span>
          <span className="cita-action-hint">{L.rescheduleHint}</span>
        </button>
      ) : (
        <div className="cita-cutoff-note">
          {props.remainingReschedules <= 0
            ? L.maxReschedules
            : L.cutoffReschedule(props.rescheduleCutoffHours ?? 24)}
          {props.tenantContactPhone && (
            <>
              <br />
              {L.callPhone(props.tenantContactPhone)}
            </>
          )}
        </div>
      )}

      {props.canCancel ? (
        <button
          type="button"
          className="cita-action-btn cita-action-btn-danger"
          onClick={() => setMode("cancelling")}
        >
          <span className="cita-action-title">{L.cancel}</span>
          <span className="cita-action-hint">{L.cancelHint}</span>
        </button>
      ) : (
        <div className="cita-cutoff-note">
          {L.cutoffCancel(props.cancelCutoffHours ?? 24)}
          {props.tenantContactPhone && (
            <>
              <br />
              {L.callPhone(props.tenantContactPhone)}
            </>
          )}
        </div>
      )}

      {error && <p className="cita-error">{error}</p>}
    </section>
  );
}
