import { useState } from "react";
import "./Contact.css";

const links = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/enrique-becerra-garcia/" },
  { label: "GitHub", url: "#" },
  { label: "Email", url: "mailto:quique.ebecerra@gmail.com" },
];

export default function Contact() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("https://formspree.io/f/mbdzjaqn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitMessage("Mensaje enviado correctamente. ¡Gracias!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitMessage("Error al enviar el mensaje. Inténtalo de nuevo.");
      }
    } catch {
      setSubmitMessage("Error al enviar el mensaje. Inténtalo de nuevo.");
    }

    setIsSubmitting(false);
  };

  return (
    <section className="contact" id="contacto">
      <div className="contact-container">
        <span className="section-label">// 04. contacto</span>
        <h2 className="section-title">Hablemos</h2>
        <p className="contact-description">
          ¿Tienes un proyecto interesante, una idea o simplemente quieres conectar? Escríbeme.
        </p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            className="input-field"
            placeholder="Tu nombre"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            placeholder="tu@email.com"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            className="input-field"
            placeholder="Cuéntame..."
            rows={5}
            style={{ resize: "vertical" }}
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "$ send_message →"}
          </button>
          {submitMessage && (
            <p className="submit-message" style={{ color: submitMessage.includes("correctamente") ? "#00ff88" : "#ff4444", marginTop: "10px" }}>
              {submitMessage}
            </p>
          )}
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
