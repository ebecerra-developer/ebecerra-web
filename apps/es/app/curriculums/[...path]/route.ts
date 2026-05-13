// Devuelve 410 Gone para cualquier path bajo /curriculums/*.
// El sitio antiguo (www.ebecerra.es) servía /curriculums/Curriculum-Enrique-Becerra.pdf
// y otros assets. Aún están en el índice de Google: con 410 Google los retira
// antes que con 404 ("se fue para siempre" vs "puede que vuelva").
export async function GET() {
  return new Response("Gone", {
    status: 410,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export const HEAD = GET;
