import type {
  TechContactChrome,
  TechContactForm,
} from "@ebecerra/sanity-client";
import ContactClient from "./ContactClient";

interface ContactProps {
  chrome: TechContactChrome;
  form: TechContactForm;
}

export default function Contact({ chrome, form }: ContactProps) {
  return <ContactClient chrome={chrome} form={form} />;
}
