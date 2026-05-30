import { getLocale } from "next-intl/server";
import {
  getContactForm,
  type ContactSectionMeta,
  type ProfileFull,
} from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import ContactClient from "./ContactClient";

type Props = {
  contactMeta: ContactSectionMeta;
  profile?: ProfileFull | null;
};

export default async function Contact({ contactMeta, profile }: Props) {
  const locale = (await getLocale()) as Locale;
  const form = await getContactForm(locale);
  return (
    <ContactClient contactMeta={contactMeta} form={form} profile={profile} />
  );
}
