"use client";

import { useEffect, useState } from "react";
import styles from "./BeeMovementNav.module.css";

type Item = { href: string; label: string };

/**
 * Scroll-spy del nav desktop: subraya la sección visible con IntersectionObserver,
 * en vez de solo reaccionar al hover.
 */
export default function BeeMovementNavLinks({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.map((i) => i.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <ul className={styles.menu}>
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            className={active === item.href.replace("#", "") ? styles.linkActive : undefined}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
