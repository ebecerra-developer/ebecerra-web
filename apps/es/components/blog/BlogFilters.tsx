import { useTranslations } from "next-intl";
import type { BlogCategory } from "@ebecerra/sanity-client";
import styles from "./BlogFilters.module.css";

type Props = {
  /** Categorías disponibles (puede ser vacío). */
  categories: BlogCategory[];
  /** Categoría preseleccionada (slug). null = todas. */
  selectedCategory: string | null;
  /** Orden actual. */
  order: "newest" | "oldest";
  /**
   * Si está, fija la categoría / tag al renderizar — el form solo expone sort.
   * Útil en páginas /blog/categoria/[slug] y /blog/tag/[slug].
   */
  fixedScope?: "category" | "tag";
};

export default function BlogFilters({
  categories,
  selectedCategory,
  order,
  fixedScope,
}: Props) {
  const t = useTranslations("blog");

  return (
    <form className={styles.filters} method="get">
      {!fixedScope && categories.length > 0 && (
        <label className={styles.field}>
          <span className={styles.label}>{t("filterCategory")}</span>
          <select
            name="category"
            defaultValue={selectedCategory ?? ""}
            className={styles.select}
          >
            <option value="">{t("filterAll")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={styles.field}>
        <span className={styles.label}>↕</span>
        <select name="sort" defaultValue={order} className={styles.select}>
          <option value="newest">{t("sortNewest")}</option>
          <option value="oldest">{t("sortOldest")}</option>
        </select>
      </label>

      <button type="submit" className={styles.submit}>
        ↻
      </button>
    </form>
  );
}
