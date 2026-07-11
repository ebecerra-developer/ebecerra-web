"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, ProductCategory, ProductSort } from "./commerce";
import { getPriceInfo, productOnSale } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import ProductCard from "./ProductCard";
import Icon from "./Icon";
import styles from "./CategoryView.module.css";

type PriceBucket = "any" | "under" | "mid" | "over";

export default function CategoryView({
  content,
  categories,
  activeHandle,
  title,
  products,
}: {
  content: TiendaContent;
  categories: ProductCategory[];
  activeHandle: string;
  title: string;
  products: Product[];
}) {
  const t = content.category;
  const [sort, setSort] = useState<ProductSort>("relevance");
  const [bucket, setBucket] = useState<PriceBucket>("any");
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(() => {
    let list = products.slice();
    if (onlyOffers) list = list.filter(productOnSale);
    if (bucket !== "any") {
      list = list.filter((p) => {
        const a = getPriceInfo(p).amount;
        if (bucket === "under") return a < 2;
        if (bucket === "mid") return a >= 2 && a <= 5;
        return a > 5;
      });
    }
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => getPriceInfo(a).amount - getPriceInfo(b).amount);
        break;
      case "price_desc":
        list.sort((a, b) => getPriceInfo(b).amount - getPriceInfo(a).amount);
        break;
      case "name":
        list.sort((a, b) => a.title.localeCompare(b.title, "es"));
        break;
      case "offers":
        list.sort((a, b) => Number(productOnSale(b)) - Number(productOnSale(a)));
        break;
      default:
        break;
    }
    return list;
  }, [products, sort, bucket, onlyOffers]);

  const clear = () => {
    setBucket("any");
    setOnlyOffers(false);
  };

  const filtersBody = (
    <>
      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>{t.filterCategories}</h3>
        <ul className={styles.catList}>
          <li>
            <Link
              href={routes.category("todos")}
              className={styles.catLink}
              data-active={activeHandle === "todos"}
            >
              {content.category.allTitle}
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.handle}>
              <Link
                href={routes.category(c.handle)}
                className={styles.catLink}
                data-active={activeHandle === c.handle}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>{t.filterPrice}</h3>
        <div className={styles.radios}>
          {(
            [
              ["any", t.priceAny],
              ["under", t.priceUnder],
              ["mid", t.priceMid],
              ["over", t.priceOver],
            ] as [PriceBucket, string][]
          ).map(([val, label]) => (
            <label key={val} className={styles.radio}>
              <input
                type="radio"
                name="price"
                checked={bucket === val}
                onChange={() => setBucket(val)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={onlyOffers}
            onChange={(e) => setOnlyOffers(e.target.checked)}
          />
          {t.filterOnlyOffers}
        </label>
      </div>

      {(bucket !== "any" || onlyOffers) && (
        <button type="button" className={styles.clear} onClick={clear}>
          {t.clearFilters}
        </button>
      )}
    </>
  );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Migas">
          <Link href={routes.home()}>{content.product.home}</Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span>{title}</span>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.count}>
            {visible.length} {t.resultsLabel}
          </p>
        </header>

        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            <Icon name="filter" size={18} strokeWidth={1.9} />
            {t.openFilters}
          </button>
          <label className={styles.sortWrap}>
            <span className={styles.sortLabel}>{t.sortLabel}</span>
            <select
              className={styles.sort}
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
            >
              <option value="relevance">{t.sort.relevance}</option>
              <option value="price_asc">{t.sort.price_asc}</option>
              <option value="price_desc">{t.sort.price_desc}</option>
              <option value="name">{t.sort.name}</option>
              <option value="offers">{t.sort.offers}</option>
            </select>
          </label>
        </div>

        <div className={styles.layout}>
          <aside
            className={styles.sidebar}
            data-open={filtersOpen}
            aria-label={t.filtersTitle}
          >
            {filtersBody}
          </aside>

          <div className={styles.results}>
            {visible.length === 0 ? (
              <p className={styles.empty}>{t.empty}</p>
            ) : (
              <ul className={styles.grid}>
                {visible.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} content={content} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
