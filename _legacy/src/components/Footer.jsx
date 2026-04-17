import "./Footer.css";

const links = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/enrique-becerra-garcia/" },
  { label: "Email", url: "mailto:quique.ebecerra@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-text">
          © 2026 ebecerra.es — hecho con ❤️ y con un poco de 🔍 y 🧪
        </span>
        <div className="footer-links">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="footer-link"
              target={link.url.startsWith("http") ? "_blank" : undefined}
              rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
        <span className="footer-text">
          v2.0.0 · <span className="footer-status">online</span>
        </span>
      </div>
    </footer>
  );
}
