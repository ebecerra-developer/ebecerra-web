import { Annotation } from "./Annotation";

export default function AnnotationsPlaygroundPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 font-sans text-stone-900">
      <p className="font-mono text-xs tracking-widest text-stone-500 uppercase">
        Playground · rough-notation
      </p>
      <h1 className="mt-2 mb-4 text-3xl font-semibold tracking-tight">
        Kit de anotaciones — 7 tipos
      </h1>
      <p className="mb-12 max-w-xl text-stone-600">
        Todas las anotaciones vienen de{" "}
        <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-sm">
          rough-notation
        </code>
        . Se animan al cargar la página — recarga para verlo.
      </p>

      <section className="space-y-10">
        <Block title="1 · underline" subtitle="subrayado — énfasis en texto corrido">
          <p className="text-lg">
            Hago webs que{" "}
            <Annotation type="underline" color="#047857" strokeWidth={2}>
              convierten
            </Annotation>
            , no solo que se vean bonitas.
          </p>
        </Block>

        <Block title="2 · circle" subtitle="halo — rodear palabra o elemento">
          <p className="text-lg">
            La diferencia entre un sitio{" "}
            <Annotation type="circle" color="#047857" strokeWidth={2} padding={6}>
              rápido
            </Annotation>{" "}
            y uno lento son 2 segundos de atención.
          </p>
        </Block>

        <Block title="3 · box" subtitle="recuadro — agrupa o enmarca">
          <p className="text-lg">
            Stack:{" "}
            <Annotation type="box" color="#047857" strokeWidth={2} padding={[2, 6, 2, 6]}>
              Next.js + Sanity + Tailwind
            </Annotation>
          </p>
        </Block>

        <Block title="4 · highlight" subtitle="fluorescente — resalta toda la palabra">
          <p className="text-lg">
            Pienso como{" "}
            <Annotation type="highlight" color="rgba(4,120,87,.2)" iterations={2}>
              arquitecto de software
            </Annotation>
            , no como diseñador de plantillas.
          </p>
        </Block>

        <Block title="5 · strike-through" subtitle="tachado — antes/después">
          <p className="text-lg">
            <Annotation type="strike-through" color="#78716C" strokeWidth={2}>
              Agencia grande
            </Annotation>{" "}
            → trato directo conmigo.
          </p>
        </Block>

        <Block title="6 · crossed-off" subtitle="tachado en X — más enfático que el anterior">
          <p className="text-lg">
            <Annotation type="crossed-off" color="#78716C" strokeWidth={2}>
              Mínimo 6 meses de proyecto
            </Annotation>{" "}
            — también acepto cosas pequeñas.
          </p>
        </Block>

        <Block title="7 · bracket" subtitle="corchete lateral — agrupa varias líneas">
          <Annotation
            type="bracket"
            color="#047857"
            strokeWidth={2}
            as="div"
            // @ts-expect-error — rough-notation soporta brackets vía prop pero typing corto
            brackets={["left"]}
          >
            <ul className="ml-6 space-y-2 text-lg">
              <li>Auditoría técnica y de performance</li>
              <li>Propuesta de arquitectura nueva</li>
              <li>Roadmap de implementación por fases</li>
            </ul>
          </Annotation>
        </Block>
      </section>

      <hr className="my-16 border-stone-200" />

      <section>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          Variantes que podemos afinar
        </h2>
        <p className="mb-8 text-stone-600">
          Cada anotación acepta <code>strokeWidth</code>, <code>padding</code>,{" "}
          <code>iterations</code> (cuántas veces se pinta — más = más
          orgánico/grueso), <code>animationDuration</code>. Misma palabra, distintos
          ajustes:
        </p>

        <div className="space-y-6">
          <p className="text-lg">
            iterations=1 →{" "}
            <Annotation type="underline" color="#047857" iterations={1}>
              sutil
            </Annotation>
          </p>
          <p className="text-lg">
            iterations=2 (default) →{" "}
            <Annotation type="underline" color="#047857" iterations={2}>
              equilibrado
            </Annotation>
          </p>
          <p className="text-lg">
            iterations=3 →{" "}
            <Annotation type="underline" color="#047857" iterations={3}>
              más peso
            </Annotation>
          </p>
          <p className="text-lg">
            strokeWidth=3 →{" "}
            <Annotation type="underline" color="#047857" strokeWidth={3}>
              marcado
            </Annotation>
          </p>
          <p className="text-lg">
            color tinta →{" "}
            <Annotation type="underline" color="#0C0A09" strokeWidth={2}>
              neutral
            </Annotation>
          </p>
        </div>
      </section>

      <hr className="my-16 border-stone-200" />

      <section>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Notas sobre uso
        </h2>
        <ul className="space-y-3 text-stone-600">
          <li>
            <strong className="text-stone-900">Regla de oro:</strong> máximo 2-3
            anotaciones por página. Saturar mata el efecto.
          </li>
          <li>
            <strong className="text-stone-900">Animación solo la primera vez:</strong>{" "}
            se dibujan al entrar en viewport (aquí al cargar). Luego se quedan fijas.
          </li>
          <li>
            <strong className="text-stone-900">Rendimiento:</strong> rough-notation
            pesa ~4 KB gzipped. Cero impacto en Lighthouse.
          </li>
          <li>
            <strong className="text-stone-900">Accesibilidad:</strong> son SVG
            decorativo, el texto debajo es real y accesible. Los lectores de pantalla
            ignoran la anotación.
          </li>
        </ul>
      </section>
    </main>
  );
}

function Block({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-xs tracking-widest text-stone-500 uppercase">
        {title}
      </p>
      <p className="mb-3 text-sm text-stone-600">{subtitle}</p>
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        {children}
      </div>
    </div>
  );
}
