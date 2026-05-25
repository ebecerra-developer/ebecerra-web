"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TemplateMeta, TemplateField } from "@/lib/social/templates";

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
    <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
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
