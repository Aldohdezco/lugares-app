import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePhotoFiles } from "@/lib/photoStorage";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const space = await prisma.space.findUnique({ where: { id: params.id } });
  if (!space) return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
  if (space.ownerId !== userId) {
    return NextResponse.json({ error: "Solo el dueño puede editar este espacio" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
  }

  const updated = await prisma.space.update({
    where: { id: params.id },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const space = await prisma.space.findUnique({ where: { id: params.id } });
  if (!space) return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
  if (space.ownerId !== userId) {
    return NextResponse.json({ error: "Solo el dueño puede eliminar este espacio" }, { status: 403 });
  }

  // Juntamos las fotos de todos los lugares/visitas de este espacio antes de que el cascade las borre de la BD
  const places = await prisma.place.findMany({
    where: { spaceId: params.id },
    include: { visits: { include: { photos: true } } },
  });
  const allPhotoUrls = places.flatMap((p) => p.visits.flatMap((v) => v.photos.map((ph) => ph.url)));

  // Cascade en el schema borra members, places, visits y photos automáticamente
  await prisma.space.delete({ where: { id: params.id } });

  await deletePhotoFiles(allPhotoUrls);

  return NextResponse.json({ ok: true });
}
