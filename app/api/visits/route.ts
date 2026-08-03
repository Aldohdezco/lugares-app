import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { placeId, description, visitDate, photoUrls } = await req.json();

  const place = await prisma.place.findUnique({ where: { id: placeId } });
  if (!place) return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 });

  const isMember = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId: place.spaceId, userId } },
  });
  if (!isMember) return NextResponse.json({ error: "No perteneces a este espacio" }, { status: 403 });

  const visit = await prisma.visit.create({
    data: {
      placeId,
      createdById: userId,
      description: description || "",
      visitDate: new Date(visitDate),
      photos: { create: (photoUrls || []).map((url: string) => ({ url })) },
    },
    include: { photos: true, createdBy: true },
  });

  return NextResponse.json(visit);
}
