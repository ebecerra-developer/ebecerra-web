import type { TechAboutSection } from "@ebecerra/sanity-client";
import type { Feature } from "@/lib/content";

interface AboutProps {
  chrome: TechAboutSection;
  features: Feature[];
}

// dangerouslySetInnerHTML para bio1 — soporta HTML inline (<strong>, <em>)
// editado en Sanity. Es contenido controlado por el editor del propio
// proyecto (no input de usuarios).
export default function About({ chrome, features }: AboutProps) {
  return (
    <section
      id="quien_soy"
      aria-labelledby="about-heading"
      className="py-[64px] px-[clamp(20px,5vw,80px)]"
    >
      <div className="max-w-[1100px] mx-auto">
        {chrome.eyebrow && (
          <span className="text-[#00ff88] font-mono text-xs tracking-[0.15em] uppercase block mb-3">
            {chrome.eyebrow}
          </span>
        )}
        {chrome.title && (
          <h2
            id="about-heading"
            className="text-[clamp(28px,4vw,40px)] font-bold text-white tracking-tight mb-12"
          >
            {chrome.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-[#999] leading-[1.8] text-[15px] space-y-5">
            {chrome.bio1 && (
              <p dangerouslySetInnerHTML={{ __html: chrome.bio1 }} />
            )}
            {chrome.bio2 && <p>{chrome.bio2}</p>}
            {chrome.bio3 && <p>{chrome.bio3}</p>}
          </div>
          <div className="flex flex-col gap-4">
            {features.map((item) => (
              <div
                key={item.label}
                className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-6 flex gap-4 items-start hover:border-[#333] hover:shadow-[0_0_30px_rgba(0,255,136,0.04)] transition-all duration-300 cursor-default"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <div className="text-white font-medium text-sm mb-1">
                    {item.label}
                  </div>
                  <div className="text-[#a8a29e] text-[13px]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
