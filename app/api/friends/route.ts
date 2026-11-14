import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/publicUser";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: { requester: publicUser, addressee: publicUser },
  });

  return NextResponse.json(friendships);
}

// Enviar solicitud de amistad por email
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { email } = await req.json();
  const addressee = await prisma.user.findUnique({ where: { email } });
  if (!addressee) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  if (addressee.id === userId) return NextResponse.json({ error: "No puedes agregarte a ti mismo" }, { status: 400 });

  try {
    const friendship = await prisma.friendship.create({
      data: { requesterId: userId, addresseeId: addressee.id },
    });
    return NextResponse.json(friendship);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una solicitud con este usuario" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al enviar la solicitud" }, { status: 500 });
  }
}

// Aceptar / rechazar solicitud
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { friendshipId, status } = await req.json();

  const existing = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!existing) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  if (existing.addresseeId !== userId) {
    return NextResponse.json({ error: "Solo el destinatario puede responder esta solicitud" }, { status: 403 });
  }

  const friendship = await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status },
  });

  return NextResponse.json(friendship);
}
