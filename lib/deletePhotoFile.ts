import { unlink } from "fs/promises";
import path from "path";

/**
 * Borra el archivo físico correspondiente a una URL de foto (ej. "/imagenes/xxx.jpg").
 * Si la URL no apunta a nuestra carpeta local (ej. quedó una URL externa vieja)
 * o el archivo ya no existe, simplemente lo ignora sin tronar la request.
 */
export async function deletePhotoFile(url: string) {
  if (!url.startsWith("/imagenes/")) return; // no es un archivo local nuestro, no tocar

  const filePath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filePath);
  } catch {
    // el archivo ya no existe o no se pudo borrar: no es crítico, seguimos
  }
}

export async function deletePhotoFiles(urls: string[]) {
  await Promise.all(urls.map((u) => deletePhotoFile(u)));
}
