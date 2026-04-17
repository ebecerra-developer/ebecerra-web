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

const COMMANDS = {
  help: () =>
    `Comandos disponibles:\n  whoami · cat role.txt · ./skills --top · echo $STATUS\n  pwd · ls · cd <dir> · sudo <cmd> · rm -rf / · git blame · exit`,
  whoami: () => "enrique-becerra",
  "cat role.txt": () => "Tech Architect Lead @ VASS",
  "./skills --top": () => "Java · Magnolia CMS · Architecture · Spring",
  "echo $status": () => "Curious. Building. Always learning. ▋",
  pwd: () => "/tu-corazon-❤️",
  ls: () => "curiosidad.exe  cafe.jar  bugs_sin_resolver/  ideas_brillantes/  TODO_infinito.txt",
  exit: () => "De aquí no sales tan fácil 😈",
  "git blame": () => "Siempre es culpa del anterior desarrollador 🙃",
};

const isRegex = (cmd) => /[\^$*+?[\]{}|\\]/.test(cmd);
const isCd = (cmd) => cmd.startsWith("cd ");
const isSudo = (cmd) => cmd.startsWith("sudo ");
const isRm = (cmd) => cmd.startsWith("rm ");

function getResponse(input) {
  const cmd = input.toLowerCase().trim();
  if (COMMANDS[cmd]) return COMMANDS[cmd]();
  if (isCd(cmd)) return "Estate quieto, curioso 👀";
  if (isSudo(cmd)) return "Tú no eres root aquí 😏";
  if (isRm(cmd)) return "Ni se te ocurra 💀";
  if (isRegex(cmd)) return "🖕";
  return "Command not found. Type 'help' for available commands.";
}

function TerminalHero() {
  const [visible, setVisible] = useState([]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [blinkOnLast, setBlinkOnLast] = useState(true);

  useEffect(() => {
    terminalLines.forEach((line, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
      }, line.delay);
    });
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setBlinkOnLast(false);
      setOutput(getResponse(input));
      setInput("");
    }
  };

  return (
    <div className="terminal-hero">
      <div className="terminal-bar">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-label">ebecerra ~ bash</span>
      </div>
      <div className="terminal-content">
        {terminalLines.map((line, i) =>
          visible.includes(i) ? (
            <div key={i} className={`terminal-line ${line.type}`}>
              {line.type === "cmd" ? (
                <>
                  <span className="terminal-arrow">→ </span>
                  {line.text}
                </>
              ) : (
                <span className={line.text.includes("▋") && blinkOnLast ? "terminal-out-blink" : ""}>
                  {line.text}
                </span>
              )}
            </div>
          ) : null
        )}
        {visible.length >= terminalLines.length && (
          <>
            <div className="terminal-line cmd">
              <span className="terminal-arrow">→ </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="terminal-input"
                autoFocus
              />
            </div>
            {output && (
              <div className="terminal-line out" style={{ whiteSpace: "pre-line" }}>
                <span className="terminal-out-blink">{output} ▋</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Hero({ scrollTo }) {
  return (
    <section className="hero" id="home">
      <div className="hero-grid" />
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-status">
              <span className="dot-active" />
              REFACTORIZANDO 🤖
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