import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  CLOUDINARY_FOLDER,
  CLOUDINARY_INCOMING,
  cloudinaryConfig,
  deletePhotoFile,
  signCloudinary,
} from "@/lib/photoStorage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

// Carpeta física para cuando no hay Cloudinary (desarrollo): /public/imagenes
const UPLOAD_DIR = path.join(process.cwd(), "public", "imagenes");

// GET: dice al navegador cómo subir. Con Cloudinary devuelve una firma para subir
// directo (las fotos no pasan por el servidor, que en Vercel acepta máx. 4.5 MB).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const cfg = cloudinaryConfig();
  if (!cfg) return NextResponse.json({ mode: "local" });

  const params = { folder: CLOUDINARY_FOLDER, format: "jpg", timestamp: Math.floor(Date.now() / 1000), transformation: CLOUDINARY_INCOMING };
  return NextResponse.json({
    mode: "cloudinary",
    uploadUrl: `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`,
    fields: { ...params, api_key: cfg.apiKey, signature: signCloudinary(params, cfg.apiSecret) },
  });
}

// POST: subida al disco local (solo cuando no hay Cloudinary)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (cloudinaryConfig()) return NextResponse.json({ error: "Las fotos se suben a Cloudinary" }, { status: 400 });

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

// Borra una foto que el usuario quitó del picker antes de guardar el formulario
// (así no queda huérfana sin ninguna Photo apuntándola en la BD)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  await deletePhotoFile(url);
  return NextResponse.json({ ok: true });
}
