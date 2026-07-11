import Link from "next/link";
import type { ProductCategory } from "./commerce";
import { CATEGORY_ICON } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import Icon, { type IconName } from "./Icon";
import styles from "./CategoryTiles.module.css";

export default function CategoryTiles({
  categories,
  content,
}: {
  categories: ProductCategory[];
  content: TiendaContent;
}) {
  return (
    <section className={styles.section} aria-labelledby="cat-title">
      <div className={styles.inner}>
        <h2 id="cat-title" className={styles.title}>
          {content.home.categories.title}
        </h2>
        <ul className={styles.grid}>
          {categories.map((c) => {
            const icon = (CATEGORY_ICON[c.handle] ?? "cart") as IconName;
            return (
              <li key={c.handle}>
                <Link href={routes.category(c.handle)} className={styles.tile}>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <Icon name={icon} size={30} strokeWidth={1.5} />
                  </span>
                  <span className={styles.name}>{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
