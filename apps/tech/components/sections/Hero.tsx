"use client";

import { useState, useEffect, useRef } from "react";
import type { TechHero } from "@ebecerra/sanity-client";

type TerminalLine = { type: "cmd" | "out"; text: string };

interface HeroProps {
  hero: TechHero;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function TerminalHero({ terminal }: { terminal: TechHero["terminal"] }) {
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [userLines, setUserLines] = useState<TerminalLine[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const introLines: { delay: number; line: TerminalLine }[] = [
    { delay: 0, line: { type: "cmd", text: "whoami" } },
    { delay: 400, line: { type: "out", text: terminal.lines.whoamiOut ?? "" } },
    { delay: 1200, line: { type: "cmd", text: "cat role.txt" } },
    { delay: 1600, line: { type: "out", text: terminal.lines.roleOut ?? "" } },
    { delay: 2400, line: { type: "cmd", text: "./skills --top 3" } },
    { delay: 2800, line: { type: "out", text: terminal.lines.skillsOut ?? "" } },
    { delay: 3200, line: { type: "cmd", text: "echo $status" } },
    { delay: 3600, line: { type: "out", text: terminal.lines.statusOut ?? "" } },
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    introLines.forEach(({ delay, line }) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, line]);
        }, delay)
      );
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [visibleLines, userLines]);

  function focusInput() {
    inputRef.current?.focus();
  }

  function handleCommand(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    const commandMap: Record<string, string | null> = {
      help: terminal.commands.help,
      whoami: terminal.commands.whoami,
      "cat role.txt": terminal.commands.role,
      "./skills --top": terminal.commands.skills,
      "echo $status": terminal.commands.status,
      pwd: terminal.commands.pwd,
      ls: terminal.commands.ls,
      exit: terminal.commands.exit,
      "git blame": terminal.commands.gitBlame,
    };

    let response: string;
    if (commandMap[cmd]) {
      response = commandMap[cmd] as string;
    } else if (cmd.startsWith("cd ")) {
      response = terminal.cdBlocked ?? "";
    } else if (cmd.startsWith("sudo")) {
      response = terminal.sudoBlocked ?? "";
    } else if (cmd.startsWith("rm")) {
      response = terminal.rmBlocked ?? "";
    } else {
      response = (terminal.notFound ?? "command not found: {cmd}").replace(
        "{cmd}",
        cmd
      );
    }

    setUserLines((prev) => [
      ...prev,
      { type: "cmd", text: cmd },
      { type: "out", text: response },
    ]);
    setInputVal("");
  }

  const allLines = [...visibleLines, ...userLines];
  const isIdle = !isFocused && inputVal.length === 0;

  return (
    <div
      className="bg-[#0d0d0d] border border-[#333] rounded-[10px] font-mono overflow-hidden max-w-[620px] w-full shadow-[0_0_60px_rgba(0,255,136,0.08)]"
      onClick={focusInput}
    >
      <div className="bg-[#1a1a1a] px-4 py-2.5 flex items-center gap-2 border-b border-[#2a2a2a]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 text-[#555] text-xs">{terminal.title}</span>
      </div>
      <div
        ref={contentRef}
        className="p-6 min-h-[220px] max-h-[320px] overflow-y-auto cursor-text"
      >
        {allLines.map((line, i) => {
          const isCmd = line.type === "cmd";
          return (
            <div
              key={i}
              className={`mb-1 text-sm leading-[1.8] animate-fade-in-line ${
                isCmd ? "text-[#00ff88]" : "text-[#c8c8c8]"
              }`}
            >
              {isCmd && <span className="text-[#555]">→ </span>}
              {line.text}
            </div>
          );
        })}
        <div className="flex items-center text-sm mt-1">
          <span className="text-[#00ff88]">→ </span>
          <span className="relative flex-1 ml-1">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleCommand}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="bg-transparent border-none text-[#e0e0e0] font-mono text-sm outline-none w-full caret-[#00ff88] placeholder-transparent"
              placeholder={terminal.placeholder ?? ""}
              aria-label={terminal.placeholder ?? "terminal"}
            />
            {isIdle && (
              <span
                className="absolute left-0 top-0 text-[#555] font-mono text-sm pointer-events-none animate-blink"
                aria-hidden="true"
              >
                {terminal.placeholder}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ hero }: HeroProps) {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="min-h-screen flex items-center px-[clamp(20px,5vw,80px)] pt-20 pb-10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.08)_0%,rgba(0,204,255,0.05)_40%,transparent_70%)]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      <div className="max-w-[1100px] w-full mx-auto relative">
        <div className="flex items-center gap-[60px] flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <div className="text-[#00ff88] font-mono text-[13px] tracking-[0.15em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse-glow" />
              {hero.available}
            </div>
            <h1
              id="hero-heading"
              className="text-[clamp(36px,6vw,72px)] font-bold leading-[1.05] tracking-tight text-white mb-5"
            >
              {hero.firstName}
              <br />
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
                {hero.lastName}
              </span>
            </h1>
            <p className="text-lg text-[#888] leading-relaxed max-w-[440px] mb-8">
              {hero.tagline}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => scrollTo("contactar")}
                className="bg-transparent border border-[#00ff88] text-[#00ff88] px-7 py-3 rounded-md font-mono text-[13px] tracking-[0.05em] hover:bg-[#00ff88]/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-200 cursor-pointer"
              >
                {hero.ctaContact}
              </button>
              <button
                onClick={() => scrollTo("proyectos")}
                className="bg-transparent border border-[#333] text-[#888] px-7 py-3 rounded-md font-mono text-[13px] tracking-[0.05em] hover:text-[#00ff88] hover:border-[#00ff88] hover:bg-[#00ff88]/10 transition-all duration-200 cursor-pointer"
              >
                {hero.ctaProjects}
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] flex justify-center">
            <TerminalHero terminal={hero.terminal} />
          </div>
        </div>
      </div>
    </section>
  );
}
