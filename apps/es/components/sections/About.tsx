import { getTranslations } from "next-intl/server";
import type { Feature } from "@ebecerra/sanity-client";

type Stat = { value: string; label: string };

type Props = {
  features: Feature[];
};

export default async function About({ features }: Props) {
  const t = await getTranslations("about");

  const stats: Stat[] = [
    { value: "8", label: "años de oficio" },
    { value: "40+", label: "proyectos migrados" },
    { value: "100%", label: "proyectos a plazo" },
  ];

  return (
    <section
      id="sobre-mi"
      style={{
        padding: "clamp(40px, 5vw, 72px) clamp(20px, 4vw, 56px)",
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
          //{" "}
          <span style={{ color: "var(--cta)" }}>02.</span>{" "}
          {t("kicker").replace(/^\/\/\s*/i, "")}
        </div>
        <h2
          style={{
            fontSize: "clamp(32px, 4.2vw, 56px)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            margin: "0 0 40px",
            maxWidth: 680,
          }}
        >
          {t("title")}
        </h2>

        <div
          className="about-split"
          style={{
            display: "grid",
            gap: "clamp(32px, 5vw, 72px)",
            alignItems: "start",
          }}
        >
          <div
            style={{
              fontSize: 17.5,
              lineHeight: 1.75,
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ margin: "0 0 20px" }}>{t("bio1")}</p>
            <p style={{ margin: "0 0 28px" }}>{t("bio2")}</p>

            <div
              className="about-stats"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                gap: 0,
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                padding: "20px 0",
              }}
            >
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    padding: "4px 16px",
                    borderLeft:
                      i > 0 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 28,
                      fontWeight: 600,
                      color: "var(--text)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginTop: 6,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#contacto"
              className="link-accent"
              style={{
                display: "inline-block",
                marginTop: 24,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {t("viewProfile")} →
            </a>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {features.map((feature, i) => (
              <div
                key={`${feature.label}-${i}`}
                className="about-feature-card"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "20px 22px",
                  display: "flex",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--cta)",
                    letterSpacing: "0.04em",
                    paddingTop: 2,
                    fontWeight: 500,
                    minWidth: 24,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: 4,
                    }}
                  >
                    {feature.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .about-split { grid-template-columns: 1fr; }
        .about-feature-card {
          transition: transform 180ms var(--ease), border-color 180ms var(--ease), box-shadow 180ms var(--ease), background 180ms var(--ease);
        }
        .about-feature-card:hover {
          transform: translateY(-2px);
          border-color: var(--cta);
          background: var(--cta-soft);
          box-shadow: var(--sh-2);
        }
        @media (min-width: 900px) {
          .about-split { grid-template-columns: 1.2fr 1fr; }
        }
      `}</style>
    </section>
  );
}
