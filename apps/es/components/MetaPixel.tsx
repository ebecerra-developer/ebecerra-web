"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONSENT_STORAGE_KEY, CONSENT_EVENT } from "./CookieConsent";

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Píxel de Meta (Facebook/Instagram Ads) para ebecerra.es.
 *
 * El ID se lee de NEXT_PUBLIC_FB_PIXEL_ID: si no está definida (dev, preview)
 * no renderiza nada y no se ensucia el dataset.
 *
 * RGPD: el píxel SOLO se carga si el usuario ha aceptado las cookies en el
 * banner de consentimiento (CookieConsent). Sin consentimiento, no se dispara
 * ni el script ni ninguna cookie de Meta.
 *
 * En App Router las navegaciones cliente no recargan la página, así que el
 * PageView inicial lo dispara el script de init y aquí emitimos uno por cada
 * cambio de ruta posterior.
 */
export default function MetaPixel() {
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
    if (!PIXEL_ID || !consented) return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname, consented]);

  if (!PIXEL_ID || !consented) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
