import { CategoryKey } from "@/lib/categories";

type IconProps = { size?: number; strokeWidth?: number };
const base = (size = 18, sw = 1.8) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor", strokeWidth: sw,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const CategoryIcon = ({ category, size = 18, strokeWidth = 1.8 }: { category: CategoryKey } & IconProps) => {
  const p = base(size, strokeWidth);
  switch (category) {
    case "CAFETERIA":
      return <svg {...p}><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3c-.5 1 .5 1.5 0 2.5M12 3c-.5 1 .5 1.5 0 2.5"/></svg>;
    case "RESTAURANTE":
      return <svg {...p}><path d="M6 3v7a2 2 0 0 0 2 2v9M6 3v9M9 3v9M15 3c-1.5 0-2 2-2 4s.5 4 2 4v10"/></svg>;
    case "CASA":
      return <svg {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>;
    case "HOTEL":
      return <svg {...p}><path d="M3 20V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14"/><path d="M9 20h12v-7a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2z"/><path d="M6 8h.01M6 11h.01"/></svg>;
    case "PARQUE":
      return <svg {...p}><path d="M12 3 7 11h3l-4 6h5v4M12 3l5 8h-3l4 6h-5"/></svg>;
    case "CINE":
      return <svg {...p}><rect x="3" y="6" width="18" height="14" rx="1"/><path d="m3 6 3-3h3L6 6M11 6l3-3h3l-3 3M17 6l3-3M3 12h18"/></svg>;
    case "PASEO":
      return <svg {...p}><circle cx="13" cy="4.5" r="1.5"/><path d="M11 21l1.5-6-3-2 1-5 3 2 2-3 3 1M9 13l-3 2v6"/></svg>;
    case "FERIA":
      return <svg {...p}><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>;
    case "MUSEO":
      return <svg {...p}><path d="M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6M8 21v-7M12 21v-7M16 21v-7"/></svg>;
    case "BAR":
      return <svg {...p}><path d="M5 4h14l-6 8v7h3M9 19h3v-7L5 4"/></svg>;
    case "PLAYA":
      return <svg {...p}><path d="M2 21c3-2 6-2 9 0s6 2 9 0"/><path d="M12 3c4 2 6 6 6 10H6c0-4 2-8 6-10Z"/><path d="M12 3v10"/></svg>;
    case "CONCIERTO":
      return <svg {...p}><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/></svg>;
    case "DEPORTE":
      return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3c2.5 2.5 2.5 15.5 0 18M3 12h18M5 6.5c3.5 2 10.5 2 14 0M5 17.5c3.5-2 10.5-2 14 0"/></svg>;
    case "COMPRAS":
      return <svg {...p}><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>;
    default:
      return <svg {...p}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/></svg>;
  }
};
