/**
 * @ebecerra/sanity-chatbot-schema
 *
 * Schemas Sanity reusables para clientes externos con su propio Sanity workspace
 * (llaullau, futuros). Da un singleton `chatbotConfig` que cubre todo lo editable
 * del chatbot multi-tenant.
 *
 * Las apps internas del monorepo (apps/es/tech/demos) NO usan este paquete —
 * tienen el chatbot embebido como objeto en profile/demoSite vía
 * @ebecerra/sanity-schemas/schemas/chatbot.ts.
 */

export { chatbotConfigSchemas } from "./schemas";
export { chatbotConfigStructure } from "./structure/chatbotConfigStructure";
