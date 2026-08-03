export const CATEGORIES = {
  CAFETERIA:  { label: "Cafetería",   emoji: "☕", color: "#8B5E3C" },
  RESTAURANTE:{ label: "Restaurante", emoji: "🍽️", color: "#E67E22" },
  CASA:       { label: "Casa",        emoji: "🏠", color: "#2ECC71" },
  HOTEL:      { label: "Hotel",       emoji: "🏨", color: "#3498DB" },
  PARQUE:     { label: "Parque",      emoji: "🌳", color: "#27AE60" },
  CINE:       { label: "Cine",        emoji: "🎬", color: "#9B59B6" },
  PASEO:      { label: "Paseo",       emoji: "🚶", color: "#16A085" },
  FERIA:      { label: "Feria",       emoji: "🎡", color: "#E74C3C" },
  MUSEO:      { label: "Museo",       emoji: "🏛️", color: "#7F8C8D" },
  BAR:        { label: "Bar",         emoji: "🍸", color: "#C0392B" },
  PLAYA:      { label: "Playa",       emoji: "🏖️", color: "#F1C40F" },
  CONCIERTO:  { label: "Concierto",   emoji: "🎤", color: "#8E44AD" },
  DEPORTE:    { label: "Deporte",     emoji: "⚽", color: "#2980B9" },
  COMPRAS:    { label: "Compras",     emoji: "🛍️", color: "#D35400" },
  OTRO:       { label: "Otro",        emoji: "📍", color: "#34495E" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
