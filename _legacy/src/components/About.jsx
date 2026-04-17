import "./About.css";

export default function About() {
  const features = [
    { icon: "🏗️", label: "Arquitectura de Software", desc: "Diseño de sistemas escalables y mantenibles" },
    { icon: "👨‍🏫", label: "Formación técnica", desc: "Tutor, formador y coordinador de comunidades" },
    { icon: "🔍", label: "Magnolia CMS", desc: "Especialista certificado" },
    { icon: "⚙️", label: "Java & Spring", desc: "Backend sólido como base de todo lo demás" },
  ];

  return (
    <section className="about" id="sobre-mí">
      <div className="about-container">
        <span className="section-label">// 01. sobre mí</span>
        <h2 className="section-title">Un poco sobre mí 📖</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              Soy arquitecto de software con 8 años de experiencia, especializado en{" "}
              <span className="highlight">Magnolia CMS</span> y ecosistema Java. Actualmente lidero equipos técnicos en VASS y coordino el gremio VassNolia en VASS University.
            </p>
            <p>
              Me gusta entender cómo funcionan las cosas por dentro. Disfruto tanto construyendo soluciones sólidas como explicándolas y formando a otros. Si algo puede hacerse mejor, me pica la curiosidad hasta descubrir cómo.
            </p>
            <p>
              Fuera del trabajo: geek, curioso crónico, y alguien que también sabe que hay vida más allá del teclado.
            </p>
          </div>
          <div className="about-features">
            {features.map((item) => (
              <div key={item.label} className="feature-card">
                <span className="feature-icon">{item.icon}</span>
                <div className="feature-content">
                  <div className="feature-label">{item.label}</div>
                  <div className="feature-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
