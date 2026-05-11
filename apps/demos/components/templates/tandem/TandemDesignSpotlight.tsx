import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./TandemDesignSpotlight.module.css";

/**
 * Sección "diseño web" compacta — anclaje del servicio (no protagonista).
 * Mezcla web + SEO + visibilidad en asistentes con IA en una sola pieza.
 * Usa los 2 primeros lifestyleGallery como mockups.
 */
export default function TandemDesignSpotlight({ demo }: { demo: DemoSite }) {
  const mockups = demo.lifestyleGallery.slice(0, 2);

  const includes = [
    "Diseño 100% a medida — sin plantillas recicladas",
    "SEO técnico de base: velocidad, metadatos, schema, sitemap",
    "Optimizada para asistentes con IA (ChatGPT, Perplexity, Gemini)",
    "Mobile-first y panel editable: tú actualizas el copy sin depender de nadie",
  ];

  return (
    <section
      id="diseno"
      className={styles.section}
      aria-labelledby="design-heading"
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.kicker}>
            <span className={styles.kickerStar}>✦</span> Y además…
          </p>
          <h2 id="design-heading" className={styles.title}>
            Webs que se{" "}
            <span className={styles.serif}>encuentran</span>.
          </h2>
          <p className={styles.lead}>
            En Google, en redes y en los asistentes con IA. Diseño propio,
            código limpio y SEO técnico desde el primer día — para que tu
            marca aparezca donde tu cliente la busque ahora.
          </p>

          <ul className={styles.bullets}>
            {includes.map((b) => (
              <li key={b} className={styles.bullet}>
                <span className={styles.bulletDot} aria-hidden="true">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <a href="#contacto" className={styles.cta}>
            Hablamos de tu web →
          </a>
        </div>

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
                  data-pos={i === 0 ? "back" : "front"}
                >
                  <div className={styles.deviceFrame}>
                    <div className={styles.deviceBar} aria-hidden="true">
                      <span /><span /><span />
                    </div>
                    <Image
                      src={src}
                      alt={m.alt ?? "Ejemplo de web diseñada por eco."}
                      width={900}
                      height={620}
                      sizes="(min-width: 900px) 40vw, 90vw"
                      className={styles.mockupImg}
                    />
                  </div>
                </figure>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
