import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

// Carpeta física dentro del proyecto: /public/imagenes
// Al vivir en /public, Next.js la sirve directo como /imagenes/archivo.jpg
const UPLOAD_DIR = path.join(process.cwd(), "public", "imagenes");

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El archivo pesa más de 8MB" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ url: `/imagenes/${filename}` });
}

// Borra un archivo subido que el usuario quitó del picker antes de guardar el formulario
// (así no queda huérfano en disco sin ninguna Photo apuntándolo en la BD)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string" || !url.startsWith("/imagenes/")) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(url));
  try {
    await unlink(filePath);
  } catch {
    // ya no existía, no pasa nada
  }

  return NextResponse.json({ ok: true });
}
