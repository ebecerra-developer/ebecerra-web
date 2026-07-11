/* Formato de precio en euros, estilo España: "1,90 €". */

const FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEUR(amount: number): string {
  return FORMATTER.format(amount);
}
