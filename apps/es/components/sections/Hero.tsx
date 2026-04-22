import { getTranslations } from "next-intl/server";
import LogoMark from "@/components/LogoMark";
import RoughAnnotation from "@/components/RoughAnnotation";

export default async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="inicio"
      style={{
        padding: "clamp(32px, 5vw, 64px) clamp(20px, 4vw, 56px) clamp(32px, 4.5vw, 56px)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(12,10,9,0.15) 1.2px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    >
      <div
        className="hero-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(24px, 4vw, 48px)",
          alignItems: "center",
          position: "relative",
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
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            <span
              className="hero-kicker-dot"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--cta)",
              }}
            />
            {t("kicker").replace(/^\/\/\s*/, "")}
          </div>
          <h1
            style={{
              fontSize: "clamp(44px, 6.2vw, 80px)",
              lineHeight: 1.03,
              letterSpacing: "-0.028em",
              margin: "0 0 20px",
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
              margin: "0 0 28px",
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
              marginTop: 32,
              paddingTop: 20,
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
        .hero-monogram-img {
          width: clamp(90px, 14vw, 130px);
          opacity: 0.85;
          margin: 0 auto;
        }
        @keyframes heroKickerPulse {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(4,120,87,.35), 0 0 0 8px rgba(4,120,87,.12);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(4,120,87,.18), 0 0 0 14px rgba(4,120,87,0);
            transform: scale(1.15);
          }
        }
        .hero-kicker-dot {
          animation: heroKickerPulse 1.8s ease-in-out infinite;
          transform-origin: center;
        }
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 1.3fr 1fr; }
          .hero-monogram-img { width: min(380px, 100%); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
