import { getTranslations } from "next-intl/server";
import type { ProcessStep } from "@ebecerra/sanity-client";

type Props = {
  steps: ProcessStep[];
};

function StepCircle({ number }: { number: string }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "var(--bg)",
        border: "1.5px solid var(--cta)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 600,
        color: "var(--cta)",
      }}
    >
      {number}
    </div>
  );
}

export default async function Process({ steps }: Props) {
  const t = await getTranslations("process");

  const ordered = [...steps].sort((a, b) => a.order - b.order);

  return (
    <section
      id="proceso"
      aria-labelledby="process-heading"
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
          <span style={{ color: "var(--cta)" }}>03.</span>{" "}
          {t("kicker").replace(/^\/\/\s*02\.\s*/i, "")}
        </div>
        <h2
          id="process-heading"
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
          style={{ maxWidth: 620, margin: "0 0 48px", color: "var(--text-secondary)" }}
        >
          {t("lead")}
        </p>

        {/* Desktop: horizontal with connector */}
        <div className="process-desktop" style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 11,
              left: "12.5%",
              right: "12.5%",
              height: 1,
              background: "var(--border-strong)",
              zIndex: 0,
            }}
            aria-hidden="true"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${ordered.length}, 1fr)`,
              gap: 24,
              position: "relative",
              zIndex: 1,
            }}
          >
            {ordered.map((step) => {
              const number = String(step.order).padStart(2, "0");
              return (
                <div key={step._id} className="process-step">
                  <div style={{ marginBottom: 24 }}>
                    <StepCircle number={number} />
                  </div>
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.25,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14.5,
                      color: "var(--text-secondary)",
                      lineHeight: 1.65,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="process-mobile" style={{ position: "relative", paddingLeft: 32 }}>
          <div
            style={{
              position: "absolute",
              left: 11,
              top: 6,
              bottom: 6,
              width: 1,
              background: "var(--border-strong)",
            }}
            aria-hidden="true"
          />
          {ordered.map((step, i) => {
            const number = String(step.order).padStart(2, "0");
            return (
              <div
                key={step._id}
                className="process-step"
                style={{
                  position: "relative",
                  paddingBottom: i === ordered.length - 1 ? 0 : 36,
                }}
              >
                <div style={{ position: "absolute", left: -28, top: 4 }}>
                  <StepCircle number={number} />
                </div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .process-desktop { display: none; }
        .process-mobile { display: block; }
        .process-step h3 {
          transition: color 180ms var(--ease);
        }
        .process-step:hover h3 {
          color: var(--cta);
        }
        @media (min-width: 900px) {
          .process-desktop { display: block; }
          .process-mobile { display: none; }
        }
      `}</style>
    </section>
  );
}
