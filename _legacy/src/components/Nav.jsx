import { useState } from "react";
import "./Nav.css";

export default function Nav({ scrollTo }) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = ["home", "sobre mí", "experiencia", "skills", "proyectos", "contacto"];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = (item) => {
    scrollTo(item.replace(" ", "-"));
    setIsOpen(false); // Close menu after clicking
  };

  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="logo-box">eB</div>
        <span className="logo-text">eBecerra</span>
        <span className="logo-domain">.es</span>
      </div>
      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        {navItems.map((item) => (
          <span
            key={item}
            className="nav-link"
            onClick={() => handleLinkClick(item)}
          >
            {item}
          </span>
        ))}
      </div>
      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </nav>
  );
}
