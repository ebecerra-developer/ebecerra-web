/**
 * @ebecerra/sanity-booking-schema
 *
 * Schemas Sanity para el sistema de reservas multi-tenant.
 *
 * - En apps/es Sanity (workspace compartido): los tenants se crean como
 *   documentos `bookingTenantConfig` (uno por negocio) + sus `bookingService`.
 * - En el futuro, en un workspace de cliente externo, `bookingTenantConfig`
 *   se vuelve singleton de facto (solo crearán uno).
 */

export { bookingSchemas } from "./schemas";
export { bookingStructure } from "./structure/bookingStructure";
