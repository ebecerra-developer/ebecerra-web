import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./FisioFooter.module.css";

export default function FisioFooter({ demo }: { demo: DemoSite }) {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>
          <span className={styles.brandDot} aria-hidden="true" />
          {demo.businessName}
        </span>
        {demo.tagline && <span className={styles.tagline}>{demo.tagline}</span>}
        <span className={styles.legal}>
          © {year} · Demo en{" "}
          <a href="https://ebecerra.es" rel="noopener">
            ebecerra.es
          </a>
        </span>
      </div>
    </footer>
  );
}
