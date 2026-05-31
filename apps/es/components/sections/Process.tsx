import type { ProcessStep, SectionMeta } from "@ebecerra/sanity-client";
import Kicker from "@/components/Kicker";
import styles from "./Process.module.css";

type Props = {
  steps: ProcessStep[];
  sectionMeta?: SectionMeta | null;
};

function StepCircle({ number }: { number: string }) {
  return <div className={styles.stepCircle}>{number}</div>;
}

export default function Process({ steps, sectionMeta }: Props) {
  const kicker = sectionMeta?.kicker ?? "// 04. Cómo trabajamos juntos";
  const title = sectionMeta?.title ?? "De idea a sitio vivo en 4 pasos";
  const lead =
    sectionMeta?.lead ??
    "Sin consultoría interminable ni sorpresas en la factura. Un camino corto, honesto y medible desde la primera llamada hasta que tu equipo opera la web solo.";
  const ordered = [...steps].sort((a, b) => a.order - b.order);

  return (
    <section
      id="proceso"
      aria-labelledby="process-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <Kicker tone="dark">{kicker}</Kicker>
        <h2 id="process-heading" className={styles.heading}>
          {title}
        </h2>
        <p className={`lead ${styles.lead}`}>{lead}</p>

        {/* Desktop: horizontal with connector */}
        <div className={styles.desktopLayout}>
          <div className={styles.connector} aria-hidden="true" />
          <div
            className={styles.desktopGrid}
            style={{ gridTemplateColumns: `repeat(${ordered.length}, 1fr)` }}
          >
            {ordered.map((step) => {
              const number = String(step.order).padStart(2, "0");
              return (
                <div key={step._id} className={styles.step}>
                  <div className={styles.stepCircleWrapper}>
                    <StepCircle number={number} />
                  </div>
                  <h3 className={styles.stepHeading}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className={styles.mobileLayout}>
          <div className={styles.mobileTimeline} aria-hidden="true" />
          {ordered.map((step, i) => {
            const number = String(step.order).padStart(2, "0");
            const isLast = i === ordered.length - 1;
            return (
              <div
                key={step._id}
                className={isLast ? styles.mobileStepLast : styles.mobileStep}
              >
                <div className={styles.mobileStepCircle}>
                  <StepCircle number={number} />
                </div>
                <h3 className={styles.stepHeadingMobile}>{step.title}</h3>
                <p className={styles.stepDescMobile}>{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
