import { getTranslations } from "next-intl/server";
import LogoMark from "@/components/LogoMark";
import RoughAnnotation from "@/components/RoughAnnotation";

export default async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="inicio"
      style={{
        padding: "clamp(64px, 9vw, 120px) clamp(20px, 4vw, 56px) clamp(56px, 7vw, 100px)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="hero-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(32px, 6vw, 64px)",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--cta)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 28,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--cta)",
                boxShadow: "0 0 0 4px rgba(4,120,87,.15)",
              }}
            />
            {t("kicker").replace(/^\/\/\s*/, "")}
          </div>
          <h1
            style={{
              fontSize: "clamp(44px, 6.2vw, 80px)",
              lineHeight: 1.03,
              letterSpacing: "-0.028em",
              margin: "0 0 28px",
              textWrap: "balance",
            }}
          >
            {t("titleBefore")}{" "}
            <RoughAnnotation type="circle" padding={[8, 12]} strokeWidth={2.5}>
              {t("titleHighlight")}
            </RoughAnnotation>{" "}
            {t("titleAfter")}
          </h1>
          <p
            className="lead"
            style={{
              maxWidth: 560,
              margin: "0 0 36px",
              color: "var(--text-secondary)",
            }}
          >
            {t("lead")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="#contacto"
              style={{
                background: "var(--cta)",
                color: "var(--text-on-accent)",
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 500,
                padding: "14px 24px",
                borderRadius: 6,
                textDecoration: "none",
                border: "1.5px solid var(--cta)",
              }}
            >
              → {t("ctaPrimary")}
            </a>
            <a
              href="#servicios"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 500,
                padding: "14px 24px",
                borderRadius: 6,
                textDecoration: "none",
                border: "1px solid var(--border-strong)",
              }}
            >
              {t("ctaSecondary")}
            </a>
          </div>

          <div
            style={{
              marginTop: 56,
              paddingTop: 28,
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
            }}
          >
            <span>{t("metaYears")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("metaCompany")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("metaLocation")}</span>
          </div>
        </div>

        <div
          className="hero-monogram"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LogoMark
            variant="scaleDeep"
            height="auto"
            alt="eB"
            className="hero-monogram-img"
          />
        </div>
      </div>

      <style>{`
        .hero-grid { grid-template-columns: 1fr; }
        .hero-monogram-img { width: min(260px, 70vw); opacity: 0.85; margin: 0 auto; }
        @media (min-width: 900px) {
          .hero-grid { grid-template-columns: 1.3fr 1fr; }
          .hero-monogram-img { width: min(500px, 100%); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
