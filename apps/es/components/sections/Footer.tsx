import { getLocale, getTranslations } from "next-intl/server";
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

  // Columna de landings de captación (sector/zona). Estructural y bilingüe vía
  // messages — las URLs son rutas fijas; la i18n Link prefija el locale. Añadir
  // un sector nuevo = una línea aquí + su clave en messages.
  const t = await getTranslations("footerLandings");
  const landings = {
    title: t("title"),
    links: [
      { href: "/diseno-web-madrid", label: t("madrid") },
      { href: "/diseno-web-para-gestorias", label: t("gestorias") },
    ],
  };

  return <FooterClient settings={data} landings={landings} />;
}
