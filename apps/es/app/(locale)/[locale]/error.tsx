"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./Error.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main id="main" className={styles.main}>
      <div className={styles.inner}>
        <p className={styles.code}>500</p>
        <h1 className={styles.heading}>Algo ha fallado</h1>
        <p className={styles.lead}>
          Ha ocurrido un error inesperado. Si el problema persiste,{" "}
          <a href="mailto:contacto@ebecerra.es" className={styles.link}>
            escríbeme directamente
          </a>
          .
        </p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.btnPrimary}>
            Reintentar
          </button>
          <Link href="/" className={styles.btnSecondary}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
