import { VerifyHandler } from "@ebecerra/client-admin-sdk/client";

export const metadata = { title: "Verificando · ebecerra.tech admin" };

export default function VerifyPage() {
  return (
    <div className="admin-shell">
      <VerifyHandler redirectTo="/admin" />
    </div>
  );
}
