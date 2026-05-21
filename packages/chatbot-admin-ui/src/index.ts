/**
 * @ebecerra/chatbot-admin-ui
 *
 * Componentes React reusables para el admin del chatbot multi-tenant.
 * Diseñados para ser importados por cualquier web cliente (apps/es, llaullau, futuros)
 * y consumir un endpoint API local que proxea al backend central de chats.ebecerra.es.
 *
 * Convención: cada componente recibe `apiPath` (ruta local del proxy en su web)
 * y NO conoce el tenant key ni la URL del backend central — eso lo gestiona el proxy.
 */

export { MessagesView } from "./MessagesView";
export type { MessagesViewProps } from "./MessagesView";

export { UsageWidget } from "./UsageWidget";
export type { UsageWidgetProps } from "./UsageWidget";

export { SessionDetail } from "./SessionDetail";
export type { SessionDetailProps } from "./SessionDetail";
