import { VerifyHandler } from "@ebecerra/client-admin-sdk/client";

export const metadata = { title: "Verificando · ebecerra.tech admin" };

export default function VerifyPage() {
  return <VerifyHandler redirectTo="/admin/chatbot" />;
}
