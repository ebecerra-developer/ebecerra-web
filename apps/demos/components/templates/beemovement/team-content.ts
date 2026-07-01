/**
 * Contenido detallado del equipo — no modelado en el schema demoSite (no
 * tiene sentido añadir un "bio largo" genérico para una demo privada).
 * Fisio de Alejandra y Sonia se apoya en los servicios reales listados en
 * beemovementfisioterapia.com/servicios — la parte de nutrición de Paula
 * no está en su web real, así que aquí se redacta con prudencia, sin
 * inventar credenciales ni especialidades concretas que no conocemos.
 */
export type TeamMemberKey = "alejandra" | "sonia" | "paula";

export const TEAM_CONTENT: Record<
  TeamMemberKey,
  { intro: string; focus: string[] }
> = {
  alejandra: {
    intro:
      "Alejandra dirige Espacio BeeMovement y trata en consulta desde el primer día. Su enfoque combina la fisioterapia manual con técnicas invasivas — punción seca, tratamientos ecoguiados — para llegar al origen del dolor, no solo a taparlo. Es la responsable de la unidad de suelo pélvico de la clínica.",
    focus: [
      "Fisioterapia manual y readaptación deportiva",
      "Punción seca y tratamientos ecoguiados",
      "Suelo pélvico: embarazo, posparto y disfunciones",
    ],
  },
  sonia: {
    intro:
      "Sonia completa el equipo de fisioterapia con un enfoque cercano a las técnicas de recuperación y bienestar del día a día: de la presoterapia a la reeducación postural. Antes de cada sesión valora contigo qué necesita tu cuerpo, no aplica el mismo protocolo a todo el mundo.",
    focus: ["Presoterapia", "Reeducación postural global (RPG)", "Diatermia"],
  },
  paula: {
    intro:
      "Paula aporta la mirada nutricional que completa el trabajo físico del resto del equipo: cómo come y descansa tu cuerpo importa tanto como cómo se mueve. Trabaja mano a mano con fisioterapia para que la recuperación no dependa solo de la sala de tratamiento.",
    focus: [
      "Asesoramiento nutricional personalizado",
      "Acompañamiento en procesos de recuperación",
    ],
  },
};
