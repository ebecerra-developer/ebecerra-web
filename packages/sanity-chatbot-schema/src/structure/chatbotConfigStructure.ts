import type { StructureBuilder } from "sanity/structure";

/**
 * Item de Structure Builder que da acceso al singleton `chatbotConfig`
 * desde el side menu del Studio del cliente.
 *
 * Uso:
 *   structureTool({
 *     structure: (S) => S.list().items([
 *       ...otherItems,
 *       chatbotConfigStructure(S),
 *     ]),
 *   })
 */
export function chatbotConfigStructure(S: StructureBuilder) {
  return S.listItem()
    .title("Chatbot · Configuración")
    .id("chatbotConfig")
    .child(
      S.editor()
        .id("chatbotConfig")
        .schemaType("chatbotConfig")
        .documentId("chatbotConfig")
    );
}
