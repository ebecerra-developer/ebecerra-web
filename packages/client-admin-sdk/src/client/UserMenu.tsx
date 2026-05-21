"use client";

import { useEffect, useRef, useState } from "react";

export type UserMenuProps = {
  email: string;
  role?: string;
  /** Path del API logout. Default /api/auth/logout. */
  logoutApiPath?: string;
  /** A dónde redirigir tras logout. Default /admin/login. */
  logoutRedirectTo?: string;
};

function getInitials(email: string): string {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (local[0] + (local[1] ?? "")).toUpperCase();
}

export function UserMenu({
  email,
  role,
  logoutApiPath = "/api/auth/logout",
  logoutRedirectTo = "/admin/login",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(logoutApiPath, { method: "POST" });
    } finally {
      window.location.href = logoutRedirectTo;
    }
  }

  const initials = getInitials(email);

  return (
    <div className="admin-user" data-open={open} ref={ref}>
      <button
        type="button"
        className="admin-user__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="admin-user__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="admin-user__caret">▾</span>
      </button>
      <div className="admin-user__menu" role="menu">
        <div className="admin-user__menu-header">
          <div className="admin-user__menu-email">{email}</div>
          {role && <div className="admin-user__menu-role">{role}</div>}
        </div>
        <button
          type="button"
          className="admin-user__menu-item is-danger"
          onClick={handleLogout}
          disabled={loading}
          role="menuitem"
        >
          {loading ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}
