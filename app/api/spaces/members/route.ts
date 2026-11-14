import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/publicUser";
import { acceptedFriendIds } from "@/lib/friends";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const requesterId = (session.user as any).id;

  const { spaceId, userId } = await req.json();

  // Solo un miembro actual del espacio puede agregar a alguien más
  const isMember = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId: requesterId } },
  });
  if (!isMember) return NextResponse.json({ error: "No perteneces a este espacio" }, { status: 403 });

  if (!(await acceptedFriendIds(requesterId)).has(userId)) {
    return NextResponse.json({ error: "Solo puedes agregar a tus amistades" }, { status: 403 });
  }

  const member = await prisma.spaceMember.upsert({
    where: { spaceId_userId: { spaceId, userId } },
    update: {},
    create: { spaceId, userId },
    include: { user: publicUser },
  });

  return NextResponse.json(member);
}
