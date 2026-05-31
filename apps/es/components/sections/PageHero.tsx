import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
import Kicker from "@/components/Kicker";
import styles from "./PageHero.module.css";

type Props = {
  /** Texto del kicker. Formato canónico: "// PALABRA_CORTA" en uppercase. */
  kicker: string;
  /** H1 de la página. */
  title: string;
  /** Lead opcional bajo el título. */
  lead?: string;
  /** Breadcrumbs opcionales (solo en nivel ≥ 2: detalle, categoría, tag). */
  breadcrumbs?: BreadcrumbItem[];
};

/**
 * Hero canónico de páginas secundarias (no-home). Define el patrón visual
 * compartido por Blog, FAQ, Ejemplos y cualquier página secundaria futura.
 *
 * Spec: kicker ✦ con estrella (componente Kicker compartido) · H1 con `--fs-h2`
 * peso 600 izquierda · lead opcional con `.lead` global · breadcrumbs encima.
 *
 * No se crean heroes ad-hoc para páginas secundarias — todas pasan por aquí.
 * El hero de la home (Hero.tsx) es distinto a propósito.
 */
export default function PageHero({ kicker, title, lead, breadcrumbs }: Props) {
  return (
    <header className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <Kicker>{kicker}</Kicker>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={`lead ${styles.lead}`}>{lead}</p>}
    </header>
  );
}
