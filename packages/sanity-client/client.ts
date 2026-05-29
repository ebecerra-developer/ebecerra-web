import { createClient } from "next-sanity";

const projectId = "gdtxcn4l";
const dataset = "production";
const apiVersion = "2026-02-01";

// La URL del Studio embebido es relativa por defecto (/studio) cuando la app
// que importa el package es la misma que aloja el Studio (apps/es). Otros
// fronts (apps/tech, apps/demos) deben definir NEXT_PUBLIC_SANITY_STUDIO_URL
// con el origin absoluto del Studio (p.ej. https://ebecerra.es/studio) para
// que el overlay de Visual Editing pueda devolver al editor al Studio.
const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "/studio";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl,
  },
});

export const sanityProjectId = projectId;
export const sanityDataset = dataset;
export const sanityApiVersion = apiVersion;
