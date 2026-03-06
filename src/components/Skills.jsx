import { useState, useEffect, useRef } from "react";
import "./Skills.css";

const skills = [
  { name: "Java", level: 95 },
  { name: "Magnolia CMS", level: 98 },
  { name: "Spring", level: 85 },
  { name: "Architecture", level: 90 },
  { name: "JavaScript", level: 75 },
  { name: "SQL", level: 80 },
  { name: "Groovy", level: 78 },
  { name: "FreeMarker", level: 82 },
];

const tags = [
  "Maven",
  "Docker",
  "Git",
  "SVN",
  "Jenkins",
  "REST",
  "WebServices",
  "SQL",
  "FreeMarker",
  "Groovy",
  "Accessibility",
  "Responsive",
];

function SkillBar({ name, level, index }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), index * 100 + 300);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{name}</span>
        <span className="skill-level">{level}%</span>
      </div>
      <div className="skill-bar-container">
        <div
          className={`skill-bar ${animated ? "animated" : ""}`}
          style={{ width: animated ? `${level}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const [hoveredTag, setHoveredTag] = useState(null);

  return (
    <section className="skills" id="skills">
      <div className="skills-container">
        <span className="section-label">// 03. skills</span>
        <h2 className="section-title">Stack técnico</h2>
        <div className="skills-grid">
          <div className="skills-column">
            {skills.slice(0, 4).map((s, i) => (
              <SkillBar key={s.name} {...s} index={i} />
            ))}
          </div>
          <div className="skills-column">
            {skills.slice(4).map((s, i) => (
              <SkillBar key={s.name} {...s} index={i + 4} />
            ))}
          </div>
        </div>
        <div className="skills-tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className="tag-item"
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
              style={{
                borderColor: hoveredTag === tag ? "#00ff88" : "#222",
                color: hoveredTag === tag ? "#00ff88" : "#666",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
