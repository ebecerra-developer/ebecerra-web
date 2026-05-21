# @ebecerra/sanity-chatbot-schema

Schemas Sanity reusables para el sistema chatbot multi-tenant. Cada cliente externo (con su propio Sanity workspace) instala este paquete y obtiene el documento `chatbotConfig` (singleton) en su Studio.

**No usado por apps/es / apps/tech / apps/demos** — esos tienen el chatbot embebido en `profile`/`demoSite` (objeto type `chatbot` en `@ebecerra/sanity-schemas`), y el webhook handler lo lee de ahí.

## Uso

```ts
// llaullau/sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import {
  chatbotConfigSchemas,
  chatbotConfigStructure,
} from '@ebecerra/sanity-chatbot-schema';

export default defineConfig({
  // ...
  schema: {
    types: [
      ...mySchemas,
      ...chatbotConfigSchemas,
    ],
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([
            // ... otros items
            S.divider(),
            chatbotConfigStructure(S),
          ]),
    }),
  ],
});
```

## Schemas exportados

- `chatbotConfig` (document, singleton): config principal del chatbot del tenant
- `chatbotFaq` (object): item de array dentro de chatbotConfig.faqs
- `chatbotBusinessInfo` (object): bloque de datos del negocio
- `chatbotBranding` (object): paleta y look del widget

## localeString / localeText

El paquete asume que el Sanity host tiene definidos los tipos `localeString` y `localeText` (mismo nombre que en `@ebecerra/sanity-schemas/schemas/locale.ts`). Si no, configura los tipos como `string` y `text` con un wrapper externo o copia los helpers.
