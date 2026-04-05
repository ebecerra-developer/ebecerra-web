import "./Projects.css";

const projects = [
  {
    id: "piezas",
    label: "mobile · puzzle",
    title: "Piezas",
    description:
      "Juego de puzzles con tus propias fotos. Sin anuncios, sin trucos. Una experiencia personal y relajante pensada para disfrutar en cualquier momento.",
    tech: ["React", "Capacitor", "Android Nativo"],
    status: "beta",
    statusText: "beta disponible",
    links: [
      { text: "$ ver_landing", href: "/piezas-game/", external: false },
      { text: "./jugar_beta →", href: "https://piezas-game.vercel.app", external: true },
    ],
  },
  {
    id: "rpg",
    label: "web · IA · fan project",
    title: "Grand Line RPG",
    description:
      "Juego de rol narrativo ambientado en el universo de One Piece. Los LLMs actúan como narradores adaptativos que responden a tus decisiones y construyen la historia en tiempo real.",
    tech: ["React", "LLM API", "Narrative AI"],
    status: "fan",
    statusText: "fan project · no comercial",
    links: [
      { text: "$ jugar →", href: "https://rpg-chat-game.vercel.app", external: true },
    ],
  },
];

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M10 2L2 10M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Projects() {
  return (
    <section className="projects" id="proyectos">
      <div className="projects-container">
        <span className="section-label">// 04. proyectos</span>
        <h2 className="section-title">Proyectos propios</h2>
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="project-header">
                <span className="project-label">{p.label}</span>
                <span className={`project-status status-${p.status}`}>{p.statusText}</span>
              </div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.description}</p>
              <div className="project-tech">
                {p.tech.map((t) => (
                  <span key={t} className="project-tag">{t}</span>
                ))}
              </div>
              <div className="project-links">
                {p.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="btn-primary project-btn"
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
