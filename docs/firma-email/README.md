# Firma de correo — Gmail

Firma HTML para las cuentas de `@ebecerra.es` gestionadas desde Gmail.

## Dónde vive

- **Página de la firma**: `firma-gmail.html` (esta carpeta). NO se despliega —
  es solo el vehículo de copiar y pegar, con los iconos apuntando al dominio.
- **Iconos**: `apps/es/public/firma/*.png` → `https://ebecerra.es/firma/*.png`.
  Estos SÍ deben quedarse desplegados para siempre: Gmail los carga en remoto
  cada vez que alguien abre un correo. Se generan con
  `social-kit/scripts/render-firma-icons.mjs` (verde `#047857` + glifo crema
  `#f6f1e9`, coherentes con el círculo eB de las piezas sociales).

## Cómo instalarla en Gmail

1. Abrir `firma-gmail.html` en Chrome (con los iconos ya desplegados).
2. `Ctrl+A` → `Ctrl+C`.
3. Gmail → ⚙️ → **Ver todos los ajustes** → **General** → **Firma** → crear
   firma nueva (p. ej. "ebecerra marca") y pegar.
4. En **Valores predeterminados de firma**, asignarla a la dirección
   `e.becerra@ebecerra.es` (cada dirección "Enviar como" tiene su propia firma).
5. Guardar cambios al final de la página.

> Los iconos son imágenes remotas: en Gmail se ven siempre; otros clientes
> (Outlook) pueden pedirlo con "descargar imágenes". Es lo esperado.

## Pendiente

- Añadir icono/enlace de **Facebook** cuando haya URL de la página
  (el PNG `facebook.png` ya está generado).
