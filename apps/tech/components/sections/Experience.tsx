import { useTranslations } from "next-intl";
import type { ExperienceItem } from "@/lib/content";

interface ExperienceProps {
  items: ExperienceItem[];
}

export default function Experience({ items }: ExperienceProps) {
  const t = useTranslations("experience");

  return (
    <section
      id="experiencia"
      aria-labelledby="experience-heading"
      className="py-[100px] px-[clamp(20px,5vw,80px)]"
    >
      <div className="max-w-[1100px] mx-auto">
        <span className="text-[#00ff88] font-mono text-xs tracking-[0.15em] uppercase block mb-3">
          {t("eyebrow")}
        </span>
        <h2
          id="experience-heading"
          className="text-[clamp(28px,4vw,40px)] font-bold text-white tracking-tight mb-12"
        >
          {t("title")}
        </h2>
        <div className="relative pl-8">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-[#00ff88] to-transparent" />
          {items.map((exp, i) => (
            <div key={i} className="mb-8 relative">
              <div
                className={`absolute -left-[36px] top-[6px] w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  exp.tag
                    ? "bg-[#00ff88] border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.5)]"
                    : "bg-[#333] border-[#444]"
                }`}
              />
              <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-6 hover:border-[#333] hover:shadow-[0_0_30px_rgba(0,255,136,0.04)] transition-all duration-300">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div className="flex flex-wrap items-center">
                    <span className="text-white font-semibold text-[15px]">
                      {exp.role}
                    </span>
                    <span className="text-[#555] mx-2">@</span>
                    <span className="text-[#00ff88] font-medium text-[15px]">
                      {exp.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.tag && (
                      <span className="bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded px-2 py-0.5 text-[11px] font-mono">
                        {exp.tag}
                      </span>
                    )}
                    <span className="text-[#555] text-xs font-mono">
                      {exp.period}
                    </span>
                  </div>
                </div>
                <p className="text-[#777] text-[13px] leading-relaxed">
                  {exp.desc}
                </p>
                {exp.tech?.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 mt-3">
                    {exp.tech.map((t) => (
                      <li
                        key={t}
                        className="bg-[#0a0a0a] border border-[#1e1e1e] text-[#9aa] font-mono text-[11px] rounded px-2 py-0.5"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
