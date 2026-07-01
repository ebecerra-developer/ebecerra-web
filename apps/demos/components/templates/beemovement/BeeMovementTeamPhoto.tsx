"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./BeeMovementTeam.module.css";

/**
 * Réplica del efecto real de beemovementfisioterapia.com: la foto de
 * perfil (seria) cruza a una segunda foto cercana/desenfadada al hover.
 * En touch no hay hover real, así que también responde a focus/tap
 * (activeciclo) para no dejar la segunda foto inalcanzable en móvil.
 */
export default function BeeMovementTeamPhoto({
  photoUrl,
  hoverPhotoUrl,
  alt,
  initial,
}: {
  photoUrl: string | null;
  hoverPhotoUrl: string | null;
  alt: string;
  initial: string;
}) {
  const [active, setActive] = useState(false);

  if (!photoUrl) {
    return <div className={styles.photoPlaceholder}>{initial}</div>;
  }

  return (
    <div
      className={styles.photoWrap}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive((v) => !v)}
    >
      <Image
        src={photoUrl}
        alt={alt}
        fill
        sizes="(min-width: 1100px) 340px, (min-width: 700px) 50vw, 100vw"
        className={`${styles.photo} ${hoverPhotoUrl && active ? styles.photoHidden : ""}`}
      />
      {hoverPhotoUrl && (
        <Image
          src={hoverPhotoUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1100px) 340px, (min-width: 700px) 50vw, 100vw"
          className={`${styles.photo} ${styles.photoHover} ${active ? styles.photoHoverActive : ""}`}
        />
      )}
    </div>
  );
}
