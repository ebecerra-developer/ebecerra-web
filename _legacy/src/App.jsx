import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

export default function App() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">
      <Nav scrollTo={scrollTo} />
      <Hero scrollTo={scrollTo} />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}