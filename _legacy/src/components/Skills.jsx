import { useState, useEffect } from "react";
import "./Skills.css";

const skills = [
  { name: "Magnolia CMS", level: 98 },
  { name: "Java", level: 95 },
  { name: "Architecture", level: 90 },
  { name: "Leadership", level: 92 },
  { name: "Spring", level: 85 },
  { name: "Agile", level: 90 },
  { name: "Mentoring", level: 88 },
  { name: "JavaScript", level: 75 },
  { name: "SQL", level: 80 },
  { name: "Groovy", level: 78 },
  { name: "FreeMarker", level: 82 },
  { name: "Artificial Intelligence", level: 65 },
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
        <h2 className="section-title">Stack técnico 💡</h2>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <SkillBar key={s.name} {...s} index={i} />
          ))}
        </div>
        <div className="skills-tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`tag-item ${hoveredTag === tag ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
