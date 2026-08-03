type IconProps = { size?: number; className?: string };
const p = (size = 18) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor", strokeWidth: 1.8,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const IconSettings = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>
);
export const IconSun = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8"/></svg>
);
export const IconMoon = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>
);
export const IconGlobe = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg>
);
export const IconUsers = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17.5" cy="8.5" r="2.3"/><path d="M15.3 14.7c2.6.3 4.7 2.3 4.7 5.3"/></svg>
);
export const IconClose = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M5 5l14 14M19 5 5 19"/></svg>
);
export const IconPlus = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M12 5v14M5 12h14"/></svg>
);
export const IconCheck = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M4 12.5 9.5 18 20 6.5"/></svg>
);
export const IconChevronDown = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M6 9l6 6 6-6"/></svg>
);
export const IconLogout = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
);
export const IconFilter = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M4 5h16M7 12h10M10 19h4"/></svg>
);
export const IconLayers = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 17.5 12 22l9-4.5"/></svg>
);
export const IconTarget = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
);
export const IconEdit = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);
export const IconTrash = ({ size, className }: IconProps) => (
  <svg {...p(size)} className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/></svg>
);
