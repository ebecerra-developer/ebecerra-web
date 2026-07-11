import Link from "next/link";
import type { Product } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import ProductCard from "./ProductCard";
import Icon from "./Icon";
import styles from "./SearchView.module.css";

export default function SearchView({
  content,
  query,
  results,
}: {
  content: TiendaContent;
  query: string;
  results: Product[];
}) {
  const t = content.search;
  const hasQuery = query.trim().length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Migas">
          <Link href={routes.home()}>{content.product.home}</Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span>{t.title}</span>
        </nav>

        {hasQuery ? (
          <header className={styles.header}>
            <h1 className={styles.title}>
              {t.resultsFor} “{query}”
            </h1>
            <p className={styles.count}>
              {results.length} {t.resultsLabel}
            </p>
          </header>
        ) : (
          <h1 className={styles.title}>{t.title}</h1>
        )}

        {hasQuery && results.length === 0 ? (
          <div className={styles.noResults}>
            <Icon name="search" size={40} strokeWidth={1.3} />
            <p className={styles.noResultsTitle}>
              {t.noResults} “{query}”
            </p>
            <p className={styles.noResultsHint}>{t.noResultsHint}</p>
            <Link href={routes.category("todos")} className={styles.browse}>
              {content.category.allTitle}
            </Link>
          </div>
        ) : (
          <ul className={styles.grid}>
            {results.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} content={content} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
