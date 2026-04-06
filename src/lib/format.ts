export function formatPrice(value: string | null | undefined): string {
  if (!value) return "";
  const num = parseInt(value, 10);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString("es-AR")}`;
}
