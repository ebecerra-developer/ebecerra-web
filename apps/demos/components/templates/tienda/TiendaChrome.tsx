"use client";

import type { ReactNode } from "react";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import type { ProductCategory } from "./commerce";
import { tiendaContent } from "./content";
import CartProvider from "./CartProvider";
import TiendaNav from "./TiendaNav";
import TiendaCartDrawer from "./TiendaCartDrawer";
import TiendaFooter from "./TiendaFooter";
import DemoChatbot from "@/components/DemoChatbot";
import styles from "./TiendaChrome.module.css";

/**
 * Chrome compartido de la tienda (nav + drawer + footer + cesta), presente en
 * TODAS las páginas. Cada página server renderiza <TiendaChrome> alrededor de su
 * contenido. La cesta persiste entre navegaciones vía localStorage (el
 * CommerceAdapter la rehidrata en cada carga).
 */
export default function TiendaChrome({
  demo,
  locale,
  categories,
  children,
}: {
  /** Solo se usan para el chatbot (opcional). Las rutas anidadas no los pasan. */
  demo?: DemoSite;
  locale?: Locale;
  categories: ProductCategory[];
  children: ReactNode;
}) {
  const content = tiendaContent;
  return (
    <CartProvider>
      {/* data-template="tienda" scopea TODOS los tokens de la tienda (paleta
          limpia blanco/verde). Sin esto, la página hereda los tokens :root de
          fisio (crema) y todo sale con mal contraste. */}
      <div className={styles.shell} data-template="tienda">
        <TiendaNav content={content} categories={categories} />
        <main id="main" className={styles.main}>
          {children}
        </main>
        <TiendaFooter content={content} categories={categories} />
        <TiendaCartDrawer content={content} />
        {demo && <DemoChatbot demo={demo} locale={locale ?? "es"} />}
      </div>
    </CartProvider>
  );
}
