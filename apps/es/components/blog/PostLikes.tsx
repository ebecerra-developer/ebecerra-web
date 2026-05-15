"use client";

import { useState } from "react";
import styles from "./PostLikes.module.css";

type Props = {
  slug: string;
  initialCount: number;
  label: string;
  thanksLabel: string;
};

export default function PostLikes({
  slug,
  initialCount,
  label,
  thanksLabel,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    if (pending || liked) return;
    setPending(true);
    // Optimistic update.
    setCount((c) => c + 1);
    setLiked(true);

    try {
      const res = await fetch("/api/blog/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { count: number; alreadyLiked: boolean } = await res.json();
      // Sync con valor real del server.
      setCount(data.count);
    } catch (err) {
      console.error("[PostLikes] failed:", err);
      // Rollback optimista.
      setCount((c) => Math.max(0, c - 1));
      setLiked(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={handleLike}
        disabled={liked || pending}
        aria-pressed={liked}
        aria-label={label}
      >
        <span className={styles.icon} aria-hidden>
          {liked ? "♥" : "♡"}
        </span>
        {count > 0 && <span className={styles.count}>{count}</span>}
      </button>
      <span className={styles.label}>{liked ? thanksLabel : label}</span>
    </div>
  );
}
