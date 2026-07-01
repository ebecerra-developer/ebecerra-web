"use client";

import { useState } from "react";
import styles from "./BeeMovementWhatsappFloat.module.css";

/**
 * Botón flotante persistente — la feature nº1 que pidió Alejandra: que sea
 * fácil escribir por WhatsApp desde cualquier punto de la web, no solo desde
 * el bloque de contacto al final.
 */
export default function BeeMovementWhatsappFloat({ href }: { href: string }) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className={styles.wrap}>
      {!dismissed && (
        <div className={styles.bubble} role="status">
          <button
            type="button"
            className={styles.bubbleClose}
            onClick={() => setDismissed(true)}
            aria-label="Cerrar mensaje"
          >
            ✕
          </button>
          ¿Dudas rápidas? Escríbenos
        </div>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
        aria-label="Escribir por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.86.51 3.677 1.475 5.263L2 22l4.865-1.446a10.03 10.03 0 0 0 5.139 1.412h.004c5.526 0 10.004-4.478 10.004-10.004C22 6.478 17.53 2 12.004 2zm0 18.166a8.14 8.14 0 0 1-4.163-1.14l-.298-.177-2.888.858.865-2.816-.194-.29a8.15 8.15 0 0 1-1.264-4.363c0-4.51 3.669-8.18 8.18-8.18a8.13 8.13 0 0 1 5.786 2.397 8.13 8.13 0 0 1 2.393 5.786c0 4.512-3.669 8.18-8.417 8.18z" />
        </svg>
      </a>
    </div>
  );
}
