import crypto from "crypto";
import { unlink } from "fs/promises";
import path from "path";

// Las fotos viven en Cloudinary cuando está configurado (producción) y en
// /public/imagenes cuando no (desarrollo sin credenciales). Las URLs viejas
// "/imagenes/..." se siguen entendiendo para poder borrarlas.

export const CLOUDINARY_FOLDER = "lugares";
// Se aplica al subir: Cloudinary guarda la foto como JPG, reducida (máx. 2048 px) y comprimida.
export const CLOUDINARY_INCOMING = "c_limit,h_2048,w_2048/q_auto:good";

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

// Firma de la API de Cloudinary: parámetros ordenados "a=1&b=2" + secret, en SHA-1
export function signCloudinary(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

// "https://res.cloudinary.com/<cloud>/image/upload/v123/lugares/abc.jpg" -> "lugares/abc"
export function cloudinaryPublicId(url: string, cloudName: string): string | null {
  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length).replace(/^v\d+\//, "");
  const id = rest.replace(/\.[a-z0-9]+$/i, "");
  return id.startsWith(`${CLOUDINARY_FOLDER}/`) ? id : null;
}

async function deleteFromCloudinary(url: string) {
  const cfg = cloudinaryConfig();
  if (!cfg) return;
  const publicId = cloudinaryPublicId(url, cfg.cloudName);
  if (!publicId) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: cfg.apiKey,
    signature: signCloudinary({ public_id: publicId, timestamp }, cfg.apiSecret),
  });
  await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/destroy`, { method: "POST", body });
}

async function deleteLocalFile(url: string) {
  await unlink(path.join(process.cwd(), "public", "imagenes", path.basename(url)));
}

/** Borra la foto de donde esté guardada. Si falla o no es nuestra, la ignora sin tronar la request. */
export async function deletePhotoFile(url: string) {
  try {
    if (url.startsWith("/imagenes/")) await deleteLocalFile(url);
    else await deleteFromCloudinary(url);
  } catch {
    // ya no existía o no se pudo borrar: no es crítico
  }
}

export async function deletePhotoFiles(urls: string[]) {
  await Promise.all(urls.map((u) => deletePhotoFile(u)));
}
