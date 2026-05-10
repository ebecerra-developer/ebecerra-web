import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./CoachInstagramFeed.module.css";

/**
 * Mosaico tipo "feed Instagram" (referencia: llaullau-web Feed.tsx).
 * Para coach con marca personal en redes es crítico — convierte la web en
 * extensión natural del IG.
 *
 * Implementación pragmática: array de imágenes subidas a Sanity (no API
 * Instagram para evitar tokens y rate limits) con caption opcional, link al
 * post original, y CTA "Síguenos en Instagram".
 *
 * Render condicional vía flag `showInstagramFeed`.
 *
 * TODO (plan): añadir al schema `instagramFeed { enabled, handle, posts[]:
 * { image, caption, postUrl } }`.
 */
export default function CoachInstagramFeed({ demo: _demo }: { demo: DemoSite }) {
  return (
    <section className={styles.feed} aria-label="Instagram">
      <div className={styles.placeholder} data-todo="schema">
        Feed Instagram — pendiente schema (instagramFeed.enabled + posts[])
      </div>
    </section>
  );
}
