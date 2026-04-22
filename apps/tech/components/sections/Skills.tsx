"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Skill } from "@/lib/content";

interface SkillsProps {
  skills: Skill[];
  tags: string[];
}

function SkillBar({ name, level, index }: Skill & { index: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), index * 100 + 300);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1.5">
        <span className="text-[#c8c8c8] text-[13px] font-mono">{name}</span>
        <span className="text-[#00ff88] text-xs font-mono">{level}%</span>
      </div>
      <div className="bg-[#1a1a1a] rounded-sm h-1 overflow-hidden border border-[#2a2a2a]">
        <div
          className="h-full bg-gradient-to-r from-[#00ff88] to-[#00ccff] rounded-sm shadow-[0_0_8px_rgba(0,255,136,0.4)]"
          style={{
            width: animated ? `${level}%` : "0%",
            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

export default function Skills({ skills, tags }: SkillsProps) {
  const t = useTranslations("skills");
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="py-[100px] px-[clamp(20px,5vw,80px)]"
    >
      <div className="max-w-[1100px] mx-auto">
        <span className="text-[#00ff88] font-mono text-xs tracking-[0.15em] uppercase block mb-3">
          {t("eyebrow")}
        </span>
        <h2
          id="skills-heading"
          className="text-[clamp(28px,4vw,40px)] font-bold text-white tracking-tight mb-12"
        >
          {t("title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {skills.map((s, i) => (
            <SkillBar key={s.name} {...s} index={i} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 mt-10">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`bg-[#0d0d0d] border text-xs font-mono px-3.5 py-1.5 rounded transition-all duration-200 cursor-default ${
                hoveredTag === tag
                  ? "border-[#00ff88] text-[#00ff88]"
                  : "border-[#222] text-[#666]"
              }`}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
