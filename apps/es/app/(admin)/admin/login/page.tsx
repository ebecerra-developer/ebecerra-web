import type { Metadata } from "next";
import LoginButtons from "./LoginButtons";

export const metadata: Metadata = {
  title: "Login · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>ebecerra · admin</h1>
        <p>Entrar con GitHub o Google. Solo cuentas autorizadas.</p>
        <LoginButtons />
        {error && (
          <div className="login-error">
            {error === "unauthorized"
              ? "Tu cuenta no está autorizada para acceder al admin."
              : error === "oauth"
                ? "Error en el proveedor OAuth. Inténtalo de nuevo."
                : "No se pudo completar el login. Inténtalo de nuevo."}
          </div>
        )}
      </div>
    </div>
  );
}
