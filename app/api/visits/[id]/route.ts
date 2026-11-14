import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/publicUser";
import { deletePhotoFiles } from "@/lib/photoStorage";

async function assertMembership(visitId: string, userId: string) {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { place: true, photos: true },
  });
  if (!visit) return { error: NextResponse.json({ error: "Visita no encontrada" }, { status: 404 }) };

  const isMember = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId: visit.place.spaceId, userId } },
  });
  if (!isMember) return { error: NextResponse.json({ error: "No perteneces a este espacio" }, { status: 403 }) };

  return { visit };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const check = await assertMembership(params.id, userId);
  if (check.error) return check.error;
  const { visit } = check;

  const { description, visitDate, photoUrls }: { description: string; visitDate: string; photoUrls: string[] } = await req.json();

  const existingUrls = visit!.photos.map((p) => p.url);
  const toDelete = visit!.photos.filter((p) => !photoUrls.includes(p.url));
  const toDeleteIds = toDelete.map((p) => p.id);
  const toAddUrls = photoUrls.filter((u) => !existingUrls.includes(u));

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { id: { in: toDeleteIds } } }),
    prisma.photo.createMany({ data: toAddUrls.map((url) => ({ visitId: params.id, url })) }),
    prisma.visit.update({
      where: { id: params.id },
      data: { description: description || "", visitDate: new Date(visitDate) },
    }),
  ]);

  // Solo tocamos el disco después de que la BD confirmó el cambio
  await deletePhotoFiles(toDelete.map((p) => p.url));

  const updated = await prisma.visit.findUnique({
    where: { id: params.id },
    include: { photos: true, createdBy: publicUser },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const check = await assertMembership(params.id, userId);
  if (check.error) return check.error;

  // Cascade borra las fotos asociadas en la BD; acá limpiamos los archivos del disco
  await prisma.visit.delete({ where: { id: params.id } });
  await deletePhotoFiles(check.visit!.photos.map((p) => p.url));

  return NextResponse.json({ ok: true });
}
