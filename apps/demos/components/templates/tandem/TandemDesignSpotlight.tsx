import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./TandemDesignSpotlight.module.css";

/**
 * Sección "diseño web" ampliada — el carril por el que esta demo tiene
 * más cuidado. Mockups en frames + lista "qué te llevas" + mini-proceso.
 * Usa demo.lifestyleGallery (las 3 primeras imágenes) como mockups.
 */
export default function TandemDesignSpotlight({ demo }: { demo: DemoSite }) {
  const mockups = demo.lifestyleGallery.slice(0, 3);

  const includes = [
    "Diseño 100% a medida — sin plantillas WordPress recicladas",
    "Mobile-first probado en móvil real, no solo en el inspector",
    "SEO técnico de base: velocidad, metadatos, schema, sitemap",
    "Panel editable: tú actualizas el copy sin depender de nadie",
    "Formulario de contacto que sí llega a tu bandeja",
    "Hosting + dominio + SSL gestionados (o te lo dejamos listo donde tengas)",
  ];

  const steps = [
    { n: "01", t: "Briefing rápido", d: "Una llamada de 30 min para entender tu negocio y a tu cliente." },
    { n: "02", t: "Wireframe + paleta", d: "Te enseñamos cómo va a quedar antes de tocar código." },
    { n: "03", t: "Diseño y maquetación", d: "Iteramos contigo. Ves la web crecer en un entorno de prueba." },
    { n: "04", t: "Publicación", d: "Salimos a producción, te explicamos el panel y nos quedamos cerca." },
  ];

  return (
    <section
      id="diseno"
      className={styles.section}
      aria-labelledby="design-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.kicker}>
            <span className={styles.kickerStar}>✦</span> Servicio estrella
          </p>
          <h2 id="design-heading" className={styles.title}>
            Webs que tu cliente <span className={styles.serif}>recuerda</span>.
          </h2>
          <p className={styles.lead}>
            Una web que no parezca la del vecino, que cargue rápido y que
            puedas editar sin abrir un ticket. Diseño propio, código limpio
            y pensado para que vendas — no para que ganemos un premio.
          </p>
        </header>

        {mockups.length > 0 && (
          <div className={styles.mockups}>
            {mockups.map((m, i) => {
              const src = urlFor(m.image)
                .width(900)
                .auto("format")
                .url();
              return (
                <figure
                  key={i}
                  className={styles.mockup}
                  data-pos={i === 0 ? "left" : i === 1 ? "center" : "right"}
                >
                  <div className={styles.deviceFrame}>
                    <div className={styles.deviceBar} aria-hidden="true">
                      <span /><span /><span />
                    </div>
                    <Image
                      src={src}
                      alt={m.alt ?? "Ejemplo de web diseñada por tándem."}
                      width={900}
                      height={620}
                      sizes="(min-width: 1000px) 32vw, 90vw"
                      className={styles.mockupImg}
                    />
                  </div>
                </figure>
              );
            })}
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.includes}>
            <h3 className={styles.subTitle}>Qué te llevas</h3>
            <ul className={styles.bullets}>
              {includes.map((b) => (
                <li key={b} className={styles.bullet}>
                  <span className={styles.bulletDot} aria-hidden="true">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.steps}>
            <h3 className={styles.subTitle}>Cómo lo hacemos</h3>
            <ol className={styles.stepList}>
              {steps.map((s) => (
                <li key={s.n} className={styles.step}>
                  <span className={styles.stepNum}>{s.n}</span>
                  <div>
                    <p className={styles.stepTitle}>{s.t}</p>
                    <p className={styles.stepDesc}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className={styles.cta}>
          <a href="#contacto" className={styles.ctaLink}>
            Quiero una web así →
          </a>
        </div>
      </div>
    </section>
  );
}
