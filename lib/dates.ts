// Ciudad de México ya no observa horario de verano desde la reforma de 2022
// (excepto la franja fronteriza norte), así que el offset es fijo todo el año.
export const MX_TZ = "America/Mexico_City";
const MX_OFFSET = "-06:00";

// Convierte el valor de un <input type="date"> ("YYYY-MM-DD") a un instante
// preciso: mediodía en CDMX. Usamos mediodía (no medianoche) como margen de
// seguridad para que ninguna conversión de zona horaria empuje la fecha al
// día anterior o siguiente.
export function cdmxDateToISO(dateStr: string): string {
  return `${dateStr}T12:00:00.000${MX_OFFSET}`;
}

// Límites de un día completo en CDMX, para filtros de rango de fechas (gte/lte)
export function cdmxDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000${MX_OFFSET}`);
}
export function cdmxDayEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999${MX_OFFSET}`);
}

// Formatea una fecha guardada mostrando siempre la fecha tal como se ve en CDMX,
// sin importar en qué zona horaria esté el navegador de quien la ve.
export function formatDateCDMX(iso: string, lang: "es" | "en" = "es"): string {
  const locale = lang === "en" ? "en-US" : "es-MX";
  return new Date(iso).toLocaleDateString(locale, {
    timeZone: MX_TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Extrae "YYYY-MM-DD" tal como se ve en CDMX (para precargar un <input type="date">
// al editar una visita ya guardada)
export function isoToDateInputCDMX(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MX_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}
