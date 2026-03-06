import { useState } from "react";
import "./Contact.css";

const links = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/enrique-becerra-garcia/" },
  { label: "GitHub", url: "#" },
  { label: "Email", url: "mailto:quique.ebecerra@gmail.com" },
];

export default function Contact() {
  const [hoveredLink, setHoveredLink] = useState(null);

  return (
    <section className="contact" id="contacto">
      <div className="contact-container">
        <span className="section-label">// 04. contacto</span>
        <h2 className="section-title">Hablemos</h2>
        <p className="contact-description">
          ¿Tienes un proyecto interesante, una idea o simplemente quieres conectar? Escríbeme.
        </p>
        <form className="contact-form">
          <input className="input-field" placeholder="Tu nombre" type="text" />
          <input className="input-field" placeholder="tu@email.com" type="email" />
          <textarea
            className="input-field"
            placeholder="Cuéntame..."
            rows={5}
            style={{ resize: "vertical" }}
          />
          <button className="btn-primary" type="submit">
            $ send_message →
          </button>
        </form>
        <div className="contact-links">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="contact-link"
              style={{
                color: hoveredLink === link.label ? "#00ff88" : "#555",
              }}
              onMouseEnter={() => setHoveredLink(link.label)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
