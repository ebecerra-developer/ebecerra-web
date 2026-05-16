import styles from "./Breadcrumbs.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  ariaLabel?: string;
};

const SITE_URL = "https://ebecerra.es";

function toAbsolute(href: string): string {
  if (/^https?:/.test(href)) return href;
  return `${SITE_URL}${href.startsWith("/") ? href : `/${href}`}`;
}

export default function Breadcrumbs({ items, ariaLabel = "Breadcrumb" }: Props) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: toAbsolute(item.href) } : {}),
    })),
  };

  return (
    <>
      <nav className={styles.wrap} aria-label={ariaLabel}>
        <ol className={styles.list}>
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${i}-${item.label}`} className={styles.item}>
                {item.href && !isLast ? (
                  <a href={item.href} className={styles.link}>
                    {item.label}
                  </a>
                ) : (
                  <span className={styles.current} aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
