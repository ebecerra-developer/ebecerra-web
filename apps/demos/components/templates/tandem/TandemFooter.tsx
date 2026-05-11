import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./TandemFooter.module.css";

export default function TandemFooter({ demo }: { demo: DemoSite }) {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <a href="#main" className={styles.brand}>
            {demo.businessName}
          </a>
          <p className={styles.tagline}>
            <span className={styles.serif}>Marketing digital</span> sin humo
            para negocios que sí existen.
          </p>
        </div>

        <div className={styles.bottom}>
          <p className={styles.meta}>
            © {year} {demo.businessName} — Próximamente: blog
          </p>
          <p className={styles.meta}>
            <span className={styles.ink}>Hecho con cuidado en 2026.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
