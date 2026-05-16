import { useTranslations } from "next-intl";
import type { Project } from "@/lib/content";

interface ProjectsProps {
  items: Project[];
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2L2 10M10 2H5M10 2V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const statusClasses: Record<string, string> = {
  beta: "bg-[#00ff88]/[0.08] text-[#00ff88] border border-[#00ff88]/20",
  fan: "bg-[#00ccff]/[0.08] text-[#00ccff] border border-[#00ccff]/20",
  live: "bg-[#00ff88]/[0.08] text-[#00ff88] border border-[#00ff88]/20",
};

export default function Projects({ items }: ProjectsProps) {
  const t = useTranslations("projects");

  return (
    <section
      id="proyectos"
      aria-labelledby="projects-heading"
      className="py-[64px] px-[clamp(20px,5vw,80px)]"
    >
      <div className="max-w-[1100px] mx-auto">
        <span className="text-[#00ff88] font-mono text-xs tracking-[0.15em] uppercase block mb-3">
          {t("eyebrow")}
        </span>
        <h2
          id="projects-heading"
          className="text-[clamp(28px,4vw,40px)] font-bold text-white tracking-tight mb-12"
        >
          {t("title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-[#0d0d0d] border border-[#222] rounded-[10px] p-8 flex flex-col gap-4 hover:border-[#333] transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-[11px] text-[#888] tracking-[0.1em] uppercase">
                  {p.label}
                </span>
                <span
                  className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full tracking-[0.05em] whitespace-nowrap ${
                    statusClasses[p.status] ?? "text-[#666] border border-[#333]"
                  }`}
                >
                  {p.statusText}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                {p.title}
              </h3>
              <p className="text-sm text-[#888] leading-[1.7] flex-1">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="bg-[#111] border border-[#2a2a2a] text-[#a8a29e] font-mono text-[11px] px-2.5 py-1 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-2.5 flex-wrap mt-1">
                {p.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 bg-transparent border border-[#00ff88] text-[#00ff88] px-4.5 py-2 rounded-md font-mono text-xs tracking-[0.05em] hover:bg-[#00ff88]/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-200"
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.text}
                    {link.external && <ExternalIcon />}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
