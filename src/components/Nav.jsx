import "./Nav.css";

export default function Nav({ scrollTo }) {
  const navItems = ["home", "sobre mí", "experiencia", "skills", "contacto"];

  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="logo-box">EB</div>
        <span className="logo-text">ebecerra</span>
        <span className="logo-domain">.es</span>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <span
            key={item}
            className="nav-link"
            onClick={() => scrollTo(item.replace(" ", "-"))}
          >
            {item}
          </span>
        ))}
      </div>
    </nav>
  );
}
