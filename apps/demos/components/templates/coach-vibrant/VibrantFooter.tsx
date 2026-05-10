import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./VibrantFooter.module.css";

export default function VibrantFooter({ demo }: { demo: DemoSite }) {
  const year = new Date().getFullYear();
  const handle = demo.instagramFeed?.handle ?? null;
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>
          <span className={styles.brandAt}>@</span>
          {handle ?? demo.businessName.toLowerCase().replace(/\s+/g, "")}
        </p>
        <p className={styles.meta}>
          © {year} · Demo creada por <a href="https://ebecerra.es" target="_blank" rel="noopener noreferrer">ebecerra.es</a>
        </p>
      </div>
    </footer>
  );
}
