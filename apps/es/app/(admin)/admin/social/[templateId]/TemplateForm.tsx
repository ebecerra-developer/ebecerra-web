"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TemplateMeta, TemplateField } from "@/lib/social/templates";

function ScaledPreview({ html, width, height }: { html: string; width: number; height: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.3);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const update = () => setScale(el.clientWidth / width);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [width]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
      <iframe
        title="Preview"
        srcDoc={html}
        sandbox="allow-same-origin"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

interface Props {
  template: TemplateMeta;
  tenants: { id: string; name: string; slug: string }[];
  isOperator: boolean;
}

function initialValueFor(f: TemplateField): unknown {
  if (f.default !== undefined) return f.default;
  if (f.type === "list") return Array.from({ length: f.minItems ?? 3 }, () => "");
  return "";
}

const PREVIEW_DEBOUNCE_MS = 400;

export default function TemplateForm({ template, tenants, isOperator }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    for (const f of template.fields) init[f.id] = initialValueFor(f);
    return init;
  });
  const [tenantId, setTenantId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewAbortRef = useRef<AbortController | null>(null);

  function setField(id: string, value: unknown) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }
  function setListItem(id: string, index: number, value: string) {
    setValues((prev) => {
      const arr = Array.isArray(prev[id]) ? [...(prev[id] as string[])] : [];
      arr[index] = value;
      return { ...prev, [id]: arr };
    });
  }
  function addListItem(id: string, max: number | undefined) {
    setValues((prev) => {
      const arr = Array.isArray(prev[id]) ? [...(prev[id] as string[])] : [];
      if (max && arr.length >= max) return prev;
      return { ...prev, [id]: [...arr, ""] };
    });
  }
  function removeListItem(id: string, index: number, min: number | undefined) {
    setValues((prev) => {
      const arr = Array.isArray(prev[id]) ? [...(prev[id] as string[])] : [];
      if (min && arr.length <= min) return prev;
      arr.splice(index, 1);
      return { ...prev, [id]: arr };
    });
  }

  // Preview en vivo: debounce 400ms, AbortController para cancelar peticiones obsoletas
  useEffect(() => {
    const ctrl = new AbortController();
    previewAbortRef.current?.abort();
    previewAbortRef.current = ctrl;
    setPreviewLoading(true);

    const timer = setTimeout(() => {
      fetch("/api/admin/social/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          fields: values,
          tenantId: isOperator ? (tenantId || null) : undefined,
        }),
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error("preview error"))))
        .then((html) => {
          if (!ctrl.signal.aborted) {
            setPreviewHtml(html);
            setPreviewLoading(false);
          }
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setPreviewLoading(false);
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [values, tenantId, template.id, isOperator]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/social/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          fields: values,
          tenantId: isOperator ? (tenantId || null) : undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { jobId?: string; error?: { code: string; message: string } }
        | null;
      if (!res.ok || !data?.jobId) {
        throw new Error(data?.error?.message ?? `Error ${res.status}`);
      }
      router.push(`/admin/social/job/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(360px, 1fr) minmax(280px, 380px)", gap: 32, alignItems: "start" }}>
      <form onSubmit={handleSubmit}>
        {isOperator && tenants.length > 0 && (
          <div style={fieldGroupStyle}>
            <label htmlFor="tenantId" style={labelStyle}>
              Tenant (opcional — vacío = render personal)
            </label>
            <select
              id="tenantId"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              style={inputStyle}
            >
              <option value="">— Personal (sin tenant) —</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>
          </div>
        )}

        {template.fields.map((f) => {
          const value = values[f.id];
          if (f.type === "text") {
            return (
              <div key={f.id} style={fieldGroupStyle}>
                <label htmlFor={f.id} style={labelStyle}>
                  {f.label}{f.required && <span style={{ color: "#ff6f59" }}> *</span>}
                </label>
                {f.help && <div style={helpStyle}>{f.help}</div>}
                <input
                  id={f.id}
                  type="text"
                  value={typeof value === "string" ? value : ""}
                  maxLength={f.maxLength}
                  onChange={(e) => setField(f.id, e.target.value)}
                  style={inputStyle}
                />
              </div>
            );
          }
          if (f.type === "textarea") {
            return (
              <div key={f.id} style={fieldGroupStyle}>
                <label htmlFor={f.id} style={labelStyle}>
                  {f.label}{f.required && <span style={{ color: "#ff6f59" }}> *</span>}
                </label>
                {f.help && <div style={helpStyle}>{f.help}</div>}
                <textarea
                  id={f.id}
                  value={typeof value === "string" ? value : ""}
                  maxLength={f.maxLength}
                  rows={4}
                  onChange={(e) => setField(f.id, e.target.value)}
                  style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
            );
          }
          if (f.type === "list") {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            return (
              <div key={f.id} style={fieldGroupStyle}>
                <label style={labelStyle}>
                  {f.label}{f.required && <span style={{ color: "#ff6f59" }}> *</span>}
                </label>
                {f.help && <div style={helpStyle}>{f.help}</div>}
                {arr.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input
                      type="text"
                      value={item}
                      maxLength={f.itemMaxLength}
                      onChange={(e) => setListItem(f.id, i, e.target.value)}
                      style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                      placeholder={`Ítem ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem(f.id, i, f.minItems)}
                      style={smallBtnStyle}
                      disabled={!!f.minItems && arr.length <= f.minItems}
                    >
                      −
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(f.id, f.maxItems)}
                  style={smallBtnStyle}
                  disabled={!!f.maxItems && arr.length >= f.maxItems}
                >
                  + Añadir ítem
                </button>
              </div>
            );
          }
          return null;
        })}

        {error && (
          <div
            style={{
              borderColor: "#7f1d1d",
              color: "#fecaca",
              border: "1px solid #7f1d1d",
              padding: 12,
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={submitBtnStyle}>
          {submitting ? "Generando…" : "Generar"}
        </button>
      </form>

      <aside style={{ position: "sticky", top: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#a8a29e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Vista previa{previewLoading ? " · actualizando…" : ""}
        </div>
        <div
          style={{
            width: "100%",
            aspectRatio: `${template.width} / ${template.height}`,
            background: "#000",
            border: "1px solid #44403c",
            borderRadius: 6,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {previewHtml ? (
            <ScaledPreview html={previewHtml} width={template.width} height={template.height} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#57534e", fontSize: 13 }}>
              Generando preview…
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 8 }}>
          Preview a escala. El render final será {template.width}×{template.height}px.
        </div>
      </aside>
    </div>
  );
}

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: 20,
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#e7e5e4",
  marginBottom: 4,
};
const helpStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#a8a29e",
  marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0c0a09",
  border: "1px solid #44403c",
  color: "#e7e5e4",
  padding: "8px 12px",
  borderRadius: 4,
  fontSize: 14,
  marginBottom: 0,
};
const smallBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #44403c",
  color: "#d6d3d1",
  fontSize: 13,
  padding: "6px 12px",
  borderRadius: 4,
  cursor: "pointer",
};
const submitBtnStyle: React.CSSProperties = {
  background: "#047857",
  border: "none",
  color: "#fafaf9",
  fontSize: 14,
  fontWeight: 600,
  padding: "10px 24px",
  borderRadius: 4,
  cursor: "pointer",
};
