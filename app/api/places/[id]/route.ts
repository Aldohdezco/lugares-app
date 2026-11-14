import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePhotoFiles } from "@/lib/photoStorage";

async function assertMembership(placeId: string, userId: string) {
  const place = await prisma.place.findUnique({ where: { id: placeId } });
  if (!place) return { error: NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 }) };

  const isMember = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId: place.spaceId, userId } },
  });
  if (!isMember) return { error: NextResponse.json({ error: "No perteneces a este espacio" }, { status: 403 }) };

  return { place };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const check = await assertMembership(params.id, userId);
  if (check.error) return check.error;

  const { name, category } = await req.json();

  const updated = await prisma.place.update({
    where: { id: params.id },
    data: { name, category },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const check = await assertMembership(params.id, userId);
  if (check.error) return check.error;

  // Juntamos las fotos de todas las visitas de este lugar antes de que el cascade las borre de la BD
  const visits = await prisma.visit.findMany({
    where: { placeId: params.id },
    include: { photos: true },
  });
  const allPhotoUrls = visits.flatMap((v) => v.photos.map((p) => p.url));

  // Cascade en el schema borra visits y photos asociadas automáticamente
  await prisma.place.delete({ where: { id: params.id } });

  await deletePhotoFiles(allPhotoUrls);

  return NextResponse.json({ ok: true });
}
