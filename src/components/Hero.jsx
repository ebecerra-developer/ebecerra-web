import { useState, useEffect } from "react";
import "./Hero.css";

const terminalLines = [
  { delay: 0, text: "$ whoami", type: "cmd" },
  { delay: 600, text: "enrique-becerra", type: "out" },
  { delay: 1000, text: "$ cat role.txt", type: "cmd" },
  { delay: 1600, text: "Tech Architect Lead @ VASS", type: "out" },
  { delay: 2000, text: "$ ./skills --top", type: "cmd" },
  { delay: 2600, text: "Java · Magnolia CMS · Architecture · Spring", type: "out" },
  { delay: 3000, text: "$ echo $STATUS", type: "cmd" },
  { delay: 3600, text: "Curious. Building. Always learning. ▋", type: "out blink" },
];

function TerminalHero() {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    terminalLines.forEach((line, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
      }, line.delay);
    });
  }, []);

  return (
    <div className="terminal-hero">
      {/* Terminal bar */}
      <div className="terminal-bar">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-label">ebecerra ~ bash</span>
      </div>
      {/* Terminal content */}
      <div className="terminal-content">
        {terminalLines.map((line, i) => (
          visible.includes(i) ? (
            <div
              key={i}
              className={`terminal-line ${line.type}`}
            >
              {line.type === "cmd" ? (
                <>
                  <span className="terminal-arrow">→ </span>
                  {line.text}
                </>
              ) : (
                <span
                  className={line.text.includes("▋") ? "terminal-out-blink" : ""}
                >
                  {line.text}
                </span>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}

export default function Hero({ scrollTo }) {
  return (
    <section className="hero" id="home">
      {/* Background grid */}
      <div className="hero-grid" />
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-status">
              <span className="dot-active" />
              DISPONIBLE PARA NUEVOS RETOS
            </div>
            <h1 className="hero-title">
              Enrique<br />
              <span className="hero-gradient">Becerra</span>
            </h1>
            <p className="hero-description">
              Tech Architect Lead · Magnolia CMS Specialist · Formador técnico. Curioso por naturaleza, apasionado por el software bien hecho.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => scrollTo("contacto")}>
                $ get_in_touch
              </button>
              <button className="btn-primary btn-secondary" onClick={() => scrollTo("experiencia")}>
                ./ver_experiencia
              </button>
            </div>
          </div>
          <div className="hero-terminal">
            <TerminalHero />
          </div>
        </div>
      </div>
    </section>
  );
}
