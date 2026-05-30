import { getLocale } from "next-intl/server";
import { getSiteSettingsFull } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import FooterClient from "./FooterClient";

type Props = {
  // Permite override desde la page si ya tenía la data fetched. Opcional —
  // si no se pasa, el propio Footer hace fetch (Next dedupea automáticamente
  // si la misma query ya corrió en la página).
  settings?: Awaited<ReturnType<typeof getSiteSettingsFull>>;
};

export default async function Footer({ settings }: Props) {
  const data =
    settings ?? (await getSiteSettingsFull((await getLocale()) as Locale));
  return <FooterClient settings={data} />;
}
