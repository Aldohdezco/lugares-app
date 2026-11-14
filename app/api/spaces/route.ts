import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/publicUser";
import { acceptedFriendIds } from "@/lib/friends";

// Lista los espacios (individual + compartidos) del usuario
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const spaces = await prisma.space.findMany({
    where: { members: { some: { userId } } },
    include: { members: { include: { user: publicUser } } },
  });

  return NextResponse.json(spaces);
}

// Crea un espacio compartido con uno o mas amigos (por sus ids)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { name, memberIds }: { name: string; memberIds: string[] } = await req.json();

  // Solo se puede compartir con amistades aceptadas
  const friends = await acceptedFriendIds(userId);
  if ((memberIds || []).some((id) => id !== userId && !friends.has(id))) {
    return NextResponse.json({ error: "Solo puedes agregar a tus amistades" }, { status: 403 });
  }

  const space = await prisma.space.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: [userId, ...(memberIds || []).filter((id) => id !== userId)].map((id) => ({ userId: id })),
      },
    },
    include: { members: { include: { user: publicUser } } },
  });

  return NextResponse.json(space);
}
