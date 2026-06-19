"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONSENT_STORAGE_KEY, CONSENT_EVENT } from "./CookieConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics 4 para ebecerra.es.
 *
 * El ID se lee de NEXT_PUBLIC_GA_ID: si no está definida (dev, preview) no
 * renderiza nada, así el dataset no se ensucia con tráfico de localhost.
 *
 * RGPD: GA4 SOLO se carga si el usuario ha aceptado las cookies en el banner
 * de consentimiento (CookieConsent). Sin consentimiento no se carga el script
 * ni se escribe ninguna cookie de Google. Mismo mecanismo que el Píxel de Meta.
 *
 * En App Router las navegaciones cliente no recargan la página: el page_view
 * inicial lo dispara `config` y aquí emitimos uno por cada cambio de ruta.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const firstLoad = useRef(true);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setConsented(localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted");
      } catch {
        setConsented(false);
      }
    };
    read();
    window.addEventListener(CONSENT_EVENT, read);
    return () => window.removeEventListener(CONSENT_EVENT, read);
  }, []);

  useEffect(() => {
    if (!GA_ID || !consented) return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
    });
  }, [pathname, consented]);

  if (!GA_ID || !consented) return null;

  return (
    <>
      <Script
        id="ga-lib"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
