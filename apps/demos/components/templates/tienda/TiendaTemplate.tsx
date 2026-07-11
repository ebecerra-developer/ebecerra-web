import Link from "next/link";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { getCommerce, TAG } from "./commerce";
import { tiendaContent } from "./content";
import { routes } from "./routes";
import TiendaChrome from "./TiendaChrome";
import PromoHero from "./PromoHero";
import CategoryTiles from "./CategoryTiles";
import ProductRow from "./ProductRow";
import Icon, { type IconName } from "./Icon";
import styles from "./TiendaTemplate.module.css";

export default async function TiendaTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const commerce = getCommerce();
  const content = tiendaContent;

  const [
    categories,
    offersWeek,
    featured,
    offersMonth,
    recommended,
    highlight,
  ] = await Promise.all([
    commerce.listCategories(),
    commerce.listProducts({ tag: TAG.offerWeek }),
    commerce.listProducts({ tag: TAG.featured }),
    commerce.listProducts({ tag: TAG.offerMonth }),
    commerce.listProducts({ tag: TAG.recommended }),
    commerce.listProducts({ on_sale: true, sort: "price_desc", limit: 1 }),
  ]);

  const db = content.home.deliveryBand;

  return (
    <TiendaChrome demo={demo} locale={locale} categories={categories}>
      <PromoHero content={content} highlight={highlight.products[0]} />

      <section className={styles.trust} aria-label="Ventajas">
        <div className={styles.trustInner}>
          {content.home.trust.map((t) => (
            <div key={t.title} className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">
                <Icon name={t.icon as IconName} size={22} strokeWidth={1.7} />
              </span>
              <div>
                <p className={styles.trustTitle}>{t.title}</p>
                <p className={styles.trustBody}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategoryTiles categories={categories} content={content} />

      <ProductRow
        title={content.home.offersWeek.title}
        sub={content.home.offersWeek.sub}
        ctaLabel={content.home.offersWeek.cta}
        ctaHref={routes.offers()}
        products={offersWeek.products}
        content={content}
        accent
      />

      <ProductRow
        title={content.home.featured.title}
        sub={content.home.featured.sub}
        ctaLabel={content.home.featured.cta}
        ctaHref={routes.category("todos")}
        products={featured.products}
        content={content}
      />

      <section className={styles.delivery}>
        <div className={styles.deliveryInner}>
          <div className={styles.deliveryCopy}>
            <h2 className={styles.deliveryTitle}>{db.title}</h2>
            <p className={styles.deliveryBody}>{db.body}</p>
            <Link href={routes.category("todos")} className={styles.deliveryCta}>
              {db.cta}
              <Icon name="arrowRight" size={18} strokeWidth={2} />
            </Link>
            <p className={styles.deliveryNote}>{db.note}</p>
          </div>
        </div>
      </section>

      <ProductRow
        title={content.home.offersMonth.title}
        sub={content.home.offersMonth.sub}
        ctaLabel={content.home.offersMonth.cta}
        ctaHref={routes.offers()}
        products={offersMonth.products}
        content={content}
        accent
      />

      <ProductRow
        title={content.home.recommended.title}
        sub={content.home.recommended.sub}
        ctaLabel={content.home.recommended.cta}
        ctaHref={routes.category("todos")}
        products={recommended.products}
        content={content}
      />
    </TiendaChrome>
  );
}
