import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lista los espacios (individual + compartidos) del usuario
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const spaces = await prisma.space.findMany({
    where: { members: { some: { userId } } },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json(spaces);
}

// Crea un espacio compartido con uno o mas amigos (por sus ids)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { name, memberIds }: { name: string; memberIds: string[] } = await req.json();

  const space = await prisma.space.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: [userId, ...memberIds.filter((id) => id !== userId)].map((id) => ({ userId: id })),
      },
    },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json(space);
}
