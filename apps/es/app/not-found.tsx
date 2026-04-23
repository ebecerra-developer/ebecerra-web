import Link from "next/link";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <html lang="es">
      <body className={styles.body}>
        <main className={styles.main}>
          <p className={styles.code}>404</p>
          <h1 className={styles.heading}>Página no encontrada</h1>
          <p className={styles.lead}>
            Esta URL no existe o ha cambiado de dirección.
          </p>
          <Link href="/" className={styles.btn}>
            Volver al inicio
          </Link>
        </main>
      </body>
    </html>
  );
}
