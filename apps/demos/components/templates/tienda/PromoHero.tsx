import Link from "next/link";
import type { Product } from "./commerce";
import { formatEUR, getPriceInfo } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import ProductImage from "./ProductImage";
import Icon from "./Icon";
import styles from "./PromoHero.module.css";

export default function PromoHero({
  content,
  highlight,
}: {
  content: TiendaContent;
  highlight?: Product;
}) {
  const { hero } = content.home;
  const price = highlight ? getPriceInfo(highlight) : null;

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.badge}>
            <Icon name="truck" size={16} strokeWidth={1.8} />
            {hero.badge}
          </span>
          <h1 className={styles.title}>{hero.title}</h1>
          <p className={styles.sub}>{hero.sub}</p>
          <div className={styles.ctas}>
            <Link href={routes.category("todos")} className={styles.ctaPrimary}>
              {hero.ctaPrimary}
              <Icon name="arrowRight" size={18} strokeWidth={2} />
            </Link>
            <Link href={routes.offers()} className={styles.ctaSecondary}>
              {hero.ctaSecondary}
            </Link>
          </div>
          <ul className={styles.stats}>
            <li>
              <Icon name="check" size={16} strokeWidth={2.2} />
              {hero.stat1}
            </li>
            <li>
              <Icon name="check" size={16} strokeWidth={2.2} />
              {hero.stat2}
            </li>
          </ul>
        </div>

        {highlight && price && (
          <Link href={routes.product(highlight.handle)} className={styles.highlight}>
            <span className={styles.highlightTag}>
              {price.discountPct ? `-${price.discountPct}%` : content.catalog.offerTag}
            </span>
            <div className={styles.highlightImg}>
              <ProductImage product={highlight} />
            </div>
            <div className={styles.highlightInfo}>
              <p className={styles.highlightLabel}>Oferta destacada</p>
              <p className={styles.highlightName}>{highlight.title}</p>
              <p className={styles.highlightPrice}>
                <span className={styles.hpNow}>{formatEUR(price.amount)}</span>
                {price.original != null && (
                  <span className={styles.hpWas}>{formatEUR(price.original)}</span>
                )}
              </p>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
