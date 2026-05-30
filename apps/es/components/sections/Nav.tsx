import { getLocale } from "next-intl/server";
import { getSiteSettingsFull } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import NavClient from "./NavClient";

export default async function Nav() {
  const locale = (await getLocale()) as Locale;
  const settings = await getSiteSettingsFull(locale);

  return (
    <NavClient
      items={settings.nav.items}
      ctaLabel={settings.nav.ctaLabel ?? "Hablemos"}
    />
  );
}
