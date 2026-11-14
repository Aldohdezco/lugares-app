import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // La app es privada: el registro solo se abre poniendo ALLOW_REGISTRATION=true
  if (process.env.ALLOW_REGISTRATION !== "true") {
    return NextResponse.json({ error: "El registro está cerrado" }, { status: 403 });
  }

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // Crea automáticamente un espacio individual para el usuario
  await prisma.space.create({
    data: {
      name: `Lugares de ${name}`,
      ownerId: user.id,
      members: { create: { userId: user.id } },
    },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
