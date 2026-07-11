"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductCategory } from "./commerce";
import { CATEGORY_ICON } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import { useCart } from "./CartProvider";
import FisioNavMobile from "@/components/templates/fisio/FisioNavMobile";
import Icon, { type IconName } from "./Icon";
import styles from "./TiendaNav.module.css";

export default function TiendaNav({
  content,
  categories,
}: {
  content: TiendaContent;
  categories: ProductCategory[];
}) {
  const { itemCount, openCart } = useCart();
  const { nav, brand, freeShippingCopy } = content;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!catOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [catOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(routes.search(q));
  };

  const searchForm = (
    <form className={styles.search} role="search" onSubmit={submitSearch}>
      <Icon name="search" size={19} className={styles.searchIcon} />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={nav.searchPlaceholder}
        aria-label={nav.searchLabel}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchBtn}>
        {nav.searchLabel}
      </button>
    </form>
  );

  const cartButton = (
    <button
      type="button"
      className={styles.cartBtn}
      onClick={openCart}
      aria-label={`${nav.cartLabel} (${itemCount})`}
    >
      <Icon name="cart" size={22} />
      <span className={styles.cartText}>{nav.cartLabel}</span>
      {itemCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {itemCount}
        </span>
      )}
    </button>
  );

  return (
    <header className={styles.header}>
      {/* --- Barra superior --- */}
      <div className={styles.top}>
        <div className={styles.topInner}>
          <div className={styles.mobileToggle}>
            <FisioNavMobile
              brand={
                <span className={styles.drawerBrand}>
                  <img
                    src={brand.logoUrl}
                    alt=""
                    className={styles.drawerMark}
                    width={30}
                    height={30}
                  />
                  {brand.name}
                </span>
              }
              items={[
                ...categories.map((c) => ({
                  href: routes.category(c.handle),
                  label: c.name,
                })),
                { href: routes.offers(), label: nav.offersLabel },
              ]}
              ctaLabel={nav.ctaLabel}
              ctaHref={routes.offers()}
              ariaOpen={nav.openMenu}
              ariaClose={nav.closeMenu}
              ariaPrimaryNav={nav.primaryNav}
              templateScope="tienda"
            />
          </div>

          <Link href={routes.home()} className={styles.brand} aria-label={brand.name}>
            <img
              src={brand.logoUrl}
              alt=""
              className={styles.mark}
              width={42}
              height={42}
            />
            <span className={styles.brandName}>{brand.name}</span>
          </Link>

          <div className={styles.searchWrap}>{searchForm}</div>

          <div className={styles.actions}>{cartButton}</div>
        </div>

        {/* buscador en fila propia en móvil */}
        <div className={styles.searchMobile}>{searchForm}</div>
      </div>

      {/* --- Barra de categorías (desktop) --- */}
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.catWrap} ref={catRef}>
            <button
              type="button"
              className={styles.catBtn}
              onClick={() => setCatOpen((v) => !v)}
              aria-expanded={catOpen}
            >
              <Icon name="menu" size={18} strokeWidth={2} />
              {nav.categoriesLabel}
              <Icon name="chevronDown" size={16} strokeWidth={2} />
            </button>
            {catOpen && (
              <div className={styles.catPanel} role="menu">
                {categories.map((c) => {
                  const icon = (CATEGORY_ICON[c.handle] ?? "cart") as IconName;
                  return (
                    <Link
                      key={c.handle}
                      href={routes.category(c.handle)}
                      className={styles.catItem}
                      role="menuitem"
                      onClick={() => setCatOpen(false)}
                    >
                      <Icon name={icon} size={20} strokeWidth={1.6} />
                      {c.name}
                    </Link>
                  );
                })}
                <Link
                  href={routes.category("todos")}
                  className={styles.catAll}
                  onClick={() => setCatOpen(false)}
                >
                  {nav.allCategories}
                  <Icon name="chevronRight" size={15} strokeWidth={2} />
                </Link>
              </div>
            )}
          </div>

          <nav className={styles.quickLinks} aria-label={nav.primaryNav}>
            <Link href={routes.offers()} className={styles.offerLink}>
              <Icon name="tag" size={16} strokeWidth={1.8} />
              {nav.offersLabel}
            </Link>
            {categories.slice(0, 4).map((c) => (
              <Link key={c.handle} href={routes.category(c.handle)} className={styles.quickLink}>
                {c.name}
              </Link>
            ))}
          </nav>

          <span className={styles.freeShip}>
            <Icon name="truck" size={16} strokeWidth={1.8} />
            {freeShippingCopy}
          </span>
        </div>
      </div>
    </header>
  );
}
