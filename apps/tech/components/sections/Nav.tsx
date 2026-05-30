import { getLocale } from "next-intl/server";
import { getTechSiteSettings } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import NavClient from "./NavClient";

export default async function Nav() {
  const locale = (await getLocale()) as Locale;
  const settings = await getTechSiteSettings(locale);
  return <NavClient items={settings.nav.items} />;
}
