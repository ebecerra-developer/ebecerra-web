/* ==========================================================================
   Plantilla Tienda — mapa de imágenes de producto (handle → URL)
   --------------------------------------------------------------------------
   URLs de assets de Sanity (fotografía de producto generada con IA, fondo
   blanco limpio). `?w=700&q=80&auto=format` → sirve WebP/AVIF redimensionado
   desde el CDN. Editar/añadir solo aquí. Si un handle no tiene entrada, la UI
   muestra un placeholder limpio con el icono de categoría. Al migrar a Medusa,
   las imágenes vienen del producto y este archivo desaparece.
   ========================================================================== */

const CDN = "https://cdn.sanity.io/images/gdtxcn4l/production";
const PARAMS = "?w=700&q=80&auto=format";
const img = (asset: string) => `${CDN}/${asset}${PARAMS}`;

export const PRODUCT_IMAGES: Record<string, string> = {
  // Frutas y verduras
  "platano-de-canarias": img("83eda7d75f4e64319368fccf979b2d1af33c79e2-1024x1024.jpg"),
  "tomate-rama": img("d428155314ea2230e63c36339001a367bf8def7d-1024x1024.jpg"),
  "aguacate-hass": img("f75b7b4da68e89e9de6e5b85993f7a30a0fb4b16-1024x1024.jpg"),
  "naranja-de-mesa": img("ae8488e56f7db5696367bb9b00e5a21bb61146b7-1024x1024.jpg"),
  "manzana-fuji": img("5238646338f7e0affab0d05f3305a876b989a341-1024x1024.jpg"),
  "patata-para-cocinar": img("58e97fcf90f23d6622930bc71d0708267eaa976f-1024x1024.jpg"),
  // Panadería
  "pan-rustico": img("d377961ad534f8f322c8c127a122283fe05469ef-1024x1024.jpg"),
  "croissant-mantequilla": img("2c46b8b71b463c0bf13bce85fc45d18535e6dbac-1024x1024.jpg"),
  "pan-de-molde-integral": img("7dc4861afc6c2fe65c96a217a6d401d05b66fd93-1024x1024.jpg"),
  // Lácteos y huevos
  "leche-entera": img("2df243c97f3390f53edbdbe41e3802efd4b9eeae-1024x1024.jpg"),
  "huevos-camperos": img("03ce39f7866d08db04c23f40589812a46873ed2d-1024x1024.jpg"),
  "yogur-natural": img("9d595c6822f42e4d3f403323f59994d6ae2e1f95-1024x1024.jpg"),
  "queso-semicurado": img("e6becf0d577317eaff74c01320f48480e0ba4704-1024x1024.jpg"),
  // Despensa
  "aceite-oliva-virgen-extra": img("eb7a333c9a99152e68ca9fbbccf11b0efebce075-1024x1024.jpg"),
  "espaguetis": img("11d98b4b6556dd79a71f31402a43e7d77f427406-1024x1024.jpg"),
  "arroz-redondo": img("59f657165491d6aab5e0307e2b2f7c9a7a79f694-1024x1024.jpg"),
  "lentejas-pardinas": img("2e51963826c25270ecacdd3d8ef4a199fbb36526-1024x1024.jpg"),
  "tomate-frito": img("56234ecbf209ed028d09da41acefebd2e60f65cc-1024x1024.jpg"),
  // Bebidas
  "agua-mineral": img("1077e848cfe7d370b6b5fd674104694fa7f9738f-1024x1024.jpg"),
  "zumo-de-naranja": img("373bc47390b0db2f580816c16d7e4485ed5fd2df-1024x1024.jpg"),
  "cerveza-lager": img("65cc9b7b6f196c4525c0ec5aa8c7d46574d21af2-1024x1024.jpg"),
  "vino-tinto-do": img("fe83afbbac70e297e744909a0e60c7738d2a6150-1024x1024.jpg"),
  // Limpieza y hogar
  "detergente-liquido": img("dba42b954c5f550a5b45d301323192877c678bba-1024x1024.jpg"),
  "papel-higienico": img("bb1ef2c424d2d4a7e456959e67e63279c2180ce1-1024x1024.jpg"),
  "lavavajillas-mano": img("4e53a0dd9780bf254b2d063dcdf4971b270a24fb-1024x1024.jpg"),
};
