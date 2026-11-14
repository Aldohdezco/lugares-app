import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

// Integración con LifeOS (tablero personal). Solo lectura.
// Llave: LIFEOS_TOKEN, o el archivo ~/LifeOS/integration-token si LifeOS está en la misma computadora.
// Usuario: ?email= (lo manda LifeOS) o LIFEOS_USER_EMAIL.

export const dynamic = "force-dynamic";

async function expectedToken() {
  if (process.env.LIFEOS_TOKEN) return process.env.LIFEOS_TOKEN;
  try {
    const file = path.join(process.env.LIFEOS_HOME ?? path.join(os.homedir(), "LifeOS"), "integration-token");
    return (await fs.readFile(file, "utf8")).trim() || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = await expectedToken();
  if (!token) return NextResponse.json({ error: "Integración con LifeOS no configurada" }, { status: 503 });
  const given = Buffer.from(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const want = Buffer.from(token);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return NextResponse.json({ error: "Llave de LifeOS incorrecta" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email") || process.env.LIFEOS_USER_EMAIL;
  if (!email) return NextResponse.json({ error: "Falta tu correo de Lugares en la conexión de LifeOS" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: `No hay una cuenta con el correo ${email}` }, { status: 404 });

  // Lugares de los espacios en los que participa el usuario
  const spaceFilter = { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] };
  const [places, visits] = await Promise.all([
    prisma.place.findMany({ where: { space: spaceFilter }, select: { id: true, name: true, category: true, createdAt: true, _count: { select: { visits: true } } } }),
    prisma.visit.findMany({
      where: { place: { space: spaceFilter } },
      orderBy: { visitDate: "desc" },
      take: 200,
      select: { visitDate: true, description: true, place: { select: { name: true, category: true } } },
    }),
  ]);

  const base = process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const monthAgo = Date.now() - 30 * 86_400_000;
  const label = (c: string) => {
    const cat = CATEGORIES[c as keyof typeof CATEGORIES];
    return cat ? `${cat.emoji} ${cat.label}` : c;
  };
  const pending = places.filter((p) => p._count.visits === 0).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json({
    app: "lugares",
    version: 1,
    name: "Lugares",
    url: base,
    stats: [
      { label: "Lugares", value: places.length },
      { label: "Visitas", value: visits.length },
      { label: "Visitas este mes", value: visits.filter((v) => v.visitDate.getTime() >= monthAgo).length },
      { label: "Por visitar", value: pending.length },
    ],
    items: visits.slice(0, 8).map((v) => ({
      title: v.place.name,
      subtitle: `${label(v.place.category)}${v.description ? ` · ${v.description.slice(0, 80)}` : ""}`,
      date: v.visitDate.toISOString(),
      href: base,
    })),
    sections: pending.length
      ? [{ title: "Por visitar", items: pending.slice(0, 8).map((p) => ({ title: p.name, subtitle: label(p.category), date: p.createdAt.toISOString(), href: base })) }]
      : [],
  });
}
