"use client";

import { useState } from "react";

export type LogoutButtonProps = {
  apiPath?: string;
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
};

export function LogoutButton({
  apiPath = "/api/auth/logout",
  redirectTo = "/admin/login",
  className,
  children = "Cerrar sesión",
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(apiPath, { method: "POST" });
    } finally {
      window.location.href = redirectTo;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Cerrando…" : children}
    </button>
  );
}
