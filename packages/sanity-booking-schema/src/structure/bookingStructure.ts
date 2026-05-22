import type { StructureBuilder } from "sanity/structure";

/**
 * Item de Structure Builder que da acceso a "Reservas" desde el side menu.
 * Agrupa tenants config + servicios.
 *
 * Uso:
 *   structureTool({
 *     structure: (S) => S.list().items([
 *       ...otherItems,
 *       bookingStructure(S),
 *     ]),
 *   })
 */
export function bookingStructure(S: StructureBuilder) {
  return S.listItem()
    .title("Reservas")
    .id("bookings")
    .child(
      S.list()
        .title("Reservas")
        .items([
          S.listItem()
            .title("Tenants (configuración)")
            .schemaType("bookingTenantConfig")
            .child(
              S.documentTypeList("bookingTenantConfig").title(
                "Tenants con reservas"
              )
            ),
          S.listItem()
            .title("Servicios")
            .schemaType("bookingService")
            .child(
              S.documentTypeList("bookingService")
                .title("Servicios")
                .defaultOrdering([
                  { field: "sortOrder", direction: "asc" },
                ])
            ),
        ])
    );
}
