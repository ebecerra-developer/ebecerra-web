import { getTranslations } from "next-intl/server";
import type { ProcessStep, SectionMeta } from "@ebecerra/sanity-client";
import styles from "./Process.module.css";

type Props = {
  steps: ProcessStep[];
  sectionMeta?: SectionMeta | null;
};

function StepCircle({ number }: { number: string }) {
  return <div className={styles.stepCircle}>{number}</div>;
}

export default async function Process({ steps, sectionMeta }: Props) {
  const t = await getTranslations("process");

  const title = sectionMeta?.title ?? t("title");
  const lead = sectionMeta?.lead ?? t("lead");
  const ordered = [...steps].sort((a, b) => a.order - b.order);

  return (
    <section
      id="proceso"
      aria-labelledby="process-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.kicker}>
          {"// "}
          <span className={styles.kickerAccent}>03.</span>{" "}
          {t("kicker").replace(/^\/\/\s*02\.\s*/i, "")}
        </div>
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
