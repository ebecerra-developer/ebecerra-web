import { getTranslations } from "next-intl/server";
import type { Service } from "@ebecerra/sanity-client";

type Props = {
  services: Service[];
};

export default async function Services({ services }: Props) {
  const t = await getTranslations("services");

  return (
    <section
      id="servicios"
      aria-labelledby="services-heading"
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
          //{" "}
          <span style={{ color: "var(--cta)" }}>01.</span>{" "}
          {t("kicker").replace(/^\/\/\s*01\.\s*/i, "")}
        </div>
        <h2
          id="services-heading"
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
          style={{ maxWidth: 620, margin: "0 0 32px", color: "var(--text-secondary)" }}
        >
          {t("lead")}
        </p>

        <div
          className="services-grid"
          style={{
            display: "grid",
            gap: 20,
          }}
        >
          {services.map((service, index) => (
            <article
              key={service._id}
              className="service-card"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "clamp(24px, 3.5vw, 36px) clamp(22px, 3vw, 32px)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--cta)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                // {String(index + 1).padStart(2, "0")}
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.2,
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                  flex: 1,
                }}
              >
                {service.summary}
              </p>

              {service.deliverables.length > 0 && (
                <ul
                  style={{
                    margin: 0,
                    padding: "20px 0 0",
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {service.deliverables.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12.5,
                        color: "var(--text-secondary)",
                        display: "flex",
                        gap: 10,
                        alignItems: "baseline",
                      }}
                    >
                      <span style={{ color: "var(--cta)", fontWeight: 600 }}>
                        →
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {service.priceRange && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {t("priceFrom")} {service.priceRange}
                  </span>
                )}
                <a
                  href="#contacto"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13.5,
                    color: "var(--cta)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  {t("viewMore")} →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .services-grid { grid-template-columns: 1fr; }
        .service-card {
          transition: transform 180ms var(--ease), border-color 180ms var(--ease), box-shadow 180ms var(--ease);
        }
        .service-card:hover {
          transform: translateY(-2px);
          border-color: var(--cta);
          box-shadow: var(--sh-2);
        }
        @media (min-width: 1024px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </section>
  );
}
