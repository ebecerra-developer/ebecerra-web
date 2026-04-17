import { useState } from "react";
import "./Contact.css";

export default function Contact() {
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
        <span className="section-label">// 05. contacto</span>
        <h2 className="section-title">Hablemos 💌</h2>
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
            <p className={`submit-message ${submitMessage.includes("correctamente") ? "success" : "error"}`}>
              {submitMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
