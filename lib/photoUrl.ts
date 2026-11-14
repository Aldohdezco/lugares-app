// Versión optimizada de una foto para mostrarla (se puede usar en el navegador).
// En Cloudinary pide el tamaño y formato justos; las fotos locales se devuelven igual.
export function photoUrl(url: string, size?: number) {
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  const t = size ? `c_fill,w_${size},h_${size},f_auto,q_auto` : "f_auto,q_auto";
  return url.replace(marker, `${marker}${t}/`);
}
