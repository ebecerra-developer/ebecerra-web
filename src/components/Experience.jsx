import "./Experience.css";

const experience = [
  {
    company: "VASS",
    role: "Tech Architect Lead",
    period: "mar 2024 – presente",
    tag: "actual",
    desc: "Definición de arquitectura, liderazgo técnico en análisis y nuevos proyectos. Tutor y formador.",
  },
  {
    company: "VASS University",
    role: "Coordinador de gremio",
    period: "ago 2024 – presente",
    tag: "actual",
    desc: "Coordinador del gremio Magnolia DXP (VassNolia). Gestión de formación, documentación y sesiones en directo.",
  },
  {
    company: "VASS",
    role: "Arquitecto de Software",
    period: "jun 2023 – mar 2024",
    tag: null,
    desc: "Soluciones técnicas, arquitectura y liderazgo en proyectos Magnolia CMS.",
  },
  {
    company: "VASS",
    role: "Consultor / Analista Programador",
    period: "jul 2021 – oct 2023",
    tag: null,
    desc: "Análisis funcional y técnico, desarrollo full stack, formación y tutoría.",
  },
  {
    company: "Bilbomatica",
    role: "Analista Programador",
    period: "oct 2019 – jul 2021",
    tag: null,
    desc: "Proyectos Magnolia CMS. Java 8, Maven, Groovy, FreeMarker, SQL, JS, CSS.",
  },
];

export default function Experience() {
  return (
    <section className="experience" id="experiencia">
      <div className="experience-container">
        <span className="section-label">// 02. experiencia</span>
        <h2 className="section-title">Trayectoria</h2>
        <div className="experience-timeline">
          <div className="timeline-line" />
          {experience.map((exp, i) => (
            <div key={i} className="experience-item">
              <div className={`timeline-dot ${exp.tag ? "active" : ""}`} />
              <div className="experience-card">
                <div className="experience-header">
                  <div className="experience-role">
                    <span className="experience-title">{exp.role}</span>
                    <span className="experience-at">@</span>
                    <span className="experience-company">{exp.company}</span>
                  </div>
                  <div className="experience-meta">
                    {exp.tag && <span className="tag">{exp.tag}</span>}
                    <span className="experience-period">{exp.period}</span>
                  </div>
                </div>
                <p className="experience-desc">{exp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
