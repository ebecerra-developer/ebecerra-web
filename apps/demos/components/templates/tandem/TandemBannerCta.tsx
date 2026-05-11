import styles from "./TandemBannerCta.module.css";

export default function TandemBannerCta({ brand }: { brand: string }) {
  return (
    <section className={styles.banner} aria-labelledby="banner-cta-heading">
      <span className={styles.watermark} aria-hidden="true">{brand}</span>
      <div className={styles.inner}>
        <p className={styles.kicker}>
          <span aria-hidden="true">✦</span> ¿Empezamos?
        </p>
        <h2 id="banner-cta-heading" className={styles.heading}>
          Cuéntanos tu negocio en{" "}
          <span className={styles.serif}>10 minutos</span>.
        </h2>
        <p className={styles.sub}>
          Sin compromiso, sin presentaciones de PowerPoint. Una llamada para
          entendernos y decidir si encajamos.
        </p>
        <a href="#contacto" className={styles.cta}>
          Pedir esa llamada →
        </a>
      </div>
    </section>
  );
}
