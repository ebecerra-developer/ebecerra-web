import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./EditorialFooter.module.css";

export default function EditorialFooter({ demo }: { demo: DemoSite }) {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.brand}>{demo.businessName}</p>
        <p className={styles.meta}>
          © {year} · {demo.tagline ?? "Demo creada por ebecerra.es"}
        </p>
      </div>
    </footer>
  );
}
