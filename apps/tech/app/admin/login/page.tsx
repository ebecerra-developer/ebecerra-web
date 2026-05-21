import { LoginForm } from "@ebecerra/client-admin-sdk/client";

export const metadata = { title: "Acceso · ebecerra.tech admin" };

export default function LoginPage() {
  return <LoginForm tenantName="ebecerra.tech" />;
}
