import { getLocale } from "next-intl/server";
import { getTechSiteSettings } from "@ebecerra/sanity-client";
import { getFallback } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export default async function Footer() {
  const locale = (await getLocale()) as Locale;
  const settings = await getTechSiteSettings(locale);
  const fallback = getFallback(locale);
  const year = new Date().getFullYear();

  const copyright = (
    settings.footer.copyrightTemplate ?? "© {year} ebecerra.tech"
  ).replace("{year}", String(year));

  return (
    <footer className="border-t border-[#111] py-6 px-[clamp(20px,5vw,80px)]">
      <div className="flex flex-col items-center gap-2 w-full">
        <span className="text-[#a8a29e] text-xs font-mono">{copyright}</span>
        <div className="flex gap-4">
          {fallback.footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="text-[#777] text-[13px] font-mono hover:text-[#00ff88] transition-colors duration-200 no-underline"
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel={
                link.url.startsWith("http") ? "noopener noreferrer" : undefined
              }
            >
              {link.label}
            </a>
          ))}
        </div>
        <span className="text-[#a8a29e] text-xs font-mono">
          {settings.footer.version} ·{" "}
          <span className="text-[#00ff88]">{settings.footer.online}</span>
        </span>
      </div>
    </footer>
  );
}
