import Image from "next/image";
import type { DemoLifestyleImage } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./EditorialLifestyleStrip.module.css";

/**
 * Tira horizontal de fotos lifestyle. Sin textos. Estética editorial,
 * proporciones variables (no grid uniforme): primera más alta, segunda
 * más ancha, etc.
 */
export default function EditorialLifestyleStrip({
  images,
}: {
  images: DemoLifestyleImage[];
}) {
  if (images.length === 0) return null;
  const items = images.slice(0, 3);
  return (
    <section className={styles.section} aria-label="Galería">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {items.map((img, i) => {
            const url = urlFor(img.image)
              .width(900)
              .height(i === 0 ? 1200 : i === 1 ? 700 : 1100)
              .auto("format")
              .url();
            return (
              <div key={i} className={`${styles.cell} ${styles[`cell${i}`]}`}>
                <Image
                  src={url}
                  alt={img.alt ?? ""}
                  fill
                  sizes="(min-width: 1000px) 33vw, 100vw"
                  className={styles.image}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
