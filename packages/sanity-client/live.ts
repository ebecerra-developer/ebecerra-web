import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { readToken } from "./token";

// defineLive habilita:
//  1. sanityFetch: wrapper de client.fetch que aplica stega y cambia a
//     perspective drafts cuando Draft Mode está activo.
//  2. SanityLive: componente que abre una subscripción Live Content y
//     re-renderiza la página al detectar mutaciones.
//
// Si SANITY_API_READ_TOKEN está vacío, sanityFetch sigue funcionando para
// contenido publicado pero no podrá leer drafts. Eso es lo que queremos en
// despliegues de los fronts que no exponen Visual Editing todavía.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: readToken,
  browserToken: readToken,
});
