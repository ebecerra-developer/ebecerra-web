import Image from "next/image";
import type { DemoLifestyleImage } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./BeeMovementLifestyle.module.css";

/**
 * "El espacio" — tour fotográfico del local real (madera cálida, sala de
 * espera, entrada), pedido explícitamente: la web no mencionaba el local
 * más allá de la dirección en texto.
 */
export default function BeeMovementLifestyle({
  images,
}: {
  images: DemoLifestyleImage[];
}) {
  if (images.length === 0) return null;

  return (
    <section id="espacio" className={styles.section} aria-labelledby="lifestyle-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>El espacio</p>
          <h2 id="lifestyle-heading" className={styles.title}>
            Un local pensado para que te sientas bien
          </h2>
          <p className={styles.lead}>
            Madera cálida, luz suave y salas propias para cada tratamiento —
            en Av. del Dr. García Tapia, en pleno Moratalaz.
          </p>
        </header>

        <ul className={styles.grid}>
          {images.map((item, i) => {
            const url = urlFor(item.image).width(800).auto("format").url();
            return (
              <li key={i} className={styles.item}>
                <Image
                  src={url}
                  alt={item.alt ?? ""}
                  fill
                  sizes="(min-width: 900px) 25vw, 50vw"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
