import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { BlogCategory } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import styles from "./CategoryPills.module.css";

type Props = {
  categories: BlogCategory[];
  /** Slug de la categoría activa, o null para "Todas". */
  selectedSlug: string | null;
  locale: Locale;
};

const allHref = (locale: Locale) =>
  locale === "es" ? "/blog/" : `/${locale}/blog/`;

const categoryHref = (locale: Locale, slug: string) =>
  locale === "es" ? `/blog/categoria/${slug}/` : `/${locale}/blog/categoria/${slug}/`;

export default async function CategoryPills({
  categories,
  selectedSlug,
  locale,
}: Props) {
  const t = await getTranslations({ locale, namespace: "blog" });
  if (categories.length === 0) return null;

  return (
    <nav className={styles.wrap} aria-label={t("filterCategory")}>
      <Link
        href={allHref(locale)}
        className={styles.pill}
        data-active={selectedSlug === null}
        aria-current={selectedSlug === null ? "page" : undefined}
      >
        {t("filterAll")}
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={categoryHref(locale, c.slug)}
          className={styles.pill}
          data-active={selectedSlug === c.slug}
          aria-current={selectedSlug === c.slug ? "page" : undefined}
        >
          {c.title}
        </Link>
      ))}
    </nav>
  );
}
