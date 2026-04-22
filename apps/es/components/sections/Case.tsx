import { getTranslations } from "next-intl/server";
import type { FeaturedCase } from "@/lib/content";
import RoughAnnotation from "@/components/RoughAnnotation";

type Props = {
  caseStudy: FeaturedCase | null;
};

function SectionFrame({
  kicker,
  children,
}: {
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id="casos"
      aria-label="Casos"
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
          {kicker}
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function Case({ caseStudy }: Props) {
  const t = await getTranslations("case");

  if (!caseStudy) {
    return (
      <SectionFrame kicker={t("kicker")}>
        <h2
          style={{
            fontSize: "clamp(28px, 3.6vw, 48px)",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            margin: "0 0 16px",
            maxWidth: 760,
          }}
        >
          {t("placeholderTitle")}
        </h2>
        <p
          className="lead"
          style={{ maxWidth: 620, margin: "0 0 32px", color: "var(--text-secondary)" }}
        >
          {t("placeholderBody")}
        </p>
        <a
          href="#contacto"
          className="link-accent"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          → Hablemos
        </a>
      </SectionFrame>
    );
  }

  return (
    <SectionFrame kicker={t("kicker")}>
      <h2
        style={{
          fontSize: "clamp(32px, 4.2vw, 56px)",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          margin: "0 0 40px",
          maxWidth: 760,
        }}
      >
        {caseStudy.title}
      </h2>

      <div
        className="case-split"
        style={{
          display: "grid",
          gap: "clamp(32px, 5vw, 56px)",
          alignItems: "start",
        }}
      >
        <div>
          <p
            className="lead"
            style={{ margin: "0 0 32px", color: "var(--text-secondary)" }}
          >
            {caseStudy.summary}
          </p>

          {caseStudy.metrics.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
              }}
            >
              {caseStudy.metrics.map((metric) => (
                <span
                  key={metric.label}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "4px 10px",
                    borderRadius: 2,
                    letterSpacing: "0.02em",
                  }}
                >
                  {metric.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <aside
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "clamp(24px, 3vw, 32px) clamp(22px, 3vw, 28px)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            métricas clave
          </div>

          {caseStudy.metrics.map((metric, i) => (
            <div
              key={metric.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                paddingTop: i === 0 ? 0 : 12,
                borderTop: i === 0 ? "none" : "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {metric.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "var(--cta)",
                  letterSpacing: "-0.01em",
                }}
              >
                <RoughAnnotation
                  type="underline"
                  padding={2}
                  strokeWidth={2}
                  color="var(--cta-soft-strong)"
                >
                  {metric.value}
                </RoughAnnotation>
              </span>
            </div>
          ))}

          <a
            href={`/casos/${caseStudy.slug}`}
            className="link-accent"
            style={{
              marginTop: 8,
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {t("readCase")} →
          </a>
        </aside>
      </div>

      <style>{`
        .case-split { grid-template-columns: 1fr; }
        @media (min-width: 900px) {
          .case-split { grid-template-columns: 1.5fr 1fr; }
        }
      `}</style>
    </SectionFrame>
  );
}
