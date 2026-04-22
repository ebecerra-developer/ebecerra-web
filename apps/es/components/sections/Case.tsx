import { getTranslations } from "next-intl/server";
import type { CaseCard } from "@/lib/content";

type Props = {
  cases: CaseCard[];
};

export default async function Case({ cases }: Props) {
  const t = await getTranslations("cases");

  if (cases.length === 0) return null;

  return (
    <section
      id="casos"
      aria-labelledby="cases-heading"
      style={{
        padding: "clamp(40px, 5vw, 72px) clamp(20px, 4vw, 56px)",
        background: "var(--surface-subtle)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          {t("kicker")}
        </div>
        <h2
          id="cases-heading"
          style={{
            fontSize: "clamp(32px, 4.2vw, 56px)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            margin: "0 0 16px",
            maxWidth: 760,
          }}
        >
          {t("title")}
        </h2>
        <p
          className="lead"
          style={{
            maxWidth: 720,
            margin: "0 0 40px",
            color: "var(--text-secondary)",
          }}
        >
          {t("lead")}
        </p>

        <div
          className="cases-grid"
          style={{
            display: "grid",
            gap: 20,
          }}
        >
          {cases.map((c) => (
            <article
              key={c._id}
              className="case-card"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "clamp(24px, 3.5vw, 32px) clamp(22px, 3vw, 28px)",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--cta)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                {c.sector}
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.25,
                }}
              >
                {c.title}
              </h3>

              <Block label={t("contextLabel")} text={c.context} />
              <Block label={t("solutionLabel")} text={c.solution} />
              <Block label={t("resultLabel")} text={c.result} accent />

              {c.metrics.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    paddingTop: 4,
                  }}
                >
                  {c.metrics.map((m) => (
                    <span
                      key={`${c._id}-${m.label}`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-muted)",
                        background: "var(--surface-subtle)",
                        border: "1px solid var(--border)",
                        padding: "3px 9px",
                        borderRadius: 3,
                        letterSpacing: "0.02em",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        {m.label}:
                      </span>{" "}
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>
                        {m.value}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    color: "var(--cta)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  → {t("translatesLabel")}
                </span>
                {c.translatesTo}
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .cases-grid { grid-template-columns: 1fr; }
        .case-card {
          transition: transform 180ms var(--ease), border-color 180ms var(--ease), box-shadow 180ms var(--ease);
        }
        .case-card:hover {
          transform: translateY(-2px);
          border-color: var(--cta);
          box-shadow: var(--sh-2);
        }
        @media (min-width: 1024px) {
          .cases-grid { grid-template-columns: repeat(3, 1fr); align-items: start; }
        }
      `}</style>
    </section>
  );
}

function Block({
  label,
  text,
  accent = false,
}: {
  label: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: accent ? "var(--cta)" : "var(--text-muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 500,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 14.5,
          color: accent ? "var(--text)" : "var(--text-secondary)",
          lineHeight: 1.65,
          fontWeight: accent ? 500 : 400,
        }}
      >
        {text}
      </p>
    </div>
  );
}
