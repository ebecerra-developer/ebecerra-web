import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import { BookingFlow } from "@ebecerra/bookings/widget";
import styles from "./Reservas.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Bookings" : "Reservas",
    description:
      locale === "en"
        ? "Book a slot."
        : "Reserva una cita.",
    robots: { index: false, follow: false },
  };
}

export default async function ReservasPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // El BOOKING_TENANT_KEY público va por env — esto es la página piloto de
  // ebecerra.es. Cada cliente externo embebe el widget desde su propia web.
  const tenantKey = process.env.NEXT_PUBLIC_BOOKING_TENANT_KEY;
  const apiBase = process.env.NEXT_PUBLIC_BOOKINGS_API_BASE ?? "";

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <PageHero
          kicker={locale === "en" ? "Bookings" : "Reservas"}
          title={locale === "en" ? "Book a slot" : "Reserva una cita"}
        />
        <section className={styles.widgetSection}>
          {!tenantKey || !apiBase ? (
            <div className={styles.notConfigured}>
              <p>
                {locale === "en"
                  ? "Bookings are not configured for this site yet."
                  : "El sistema de reservas no está configurado en este sitio todavía."}
              </p>
            </div>
          ) : (
            <BookingFlow
              apiBase={apiBase}
              tenantKey={tenantKey}
              locale={locale === "en" ? "en" : "es"}
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
