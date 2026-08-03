import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cdmxDayStart, cdmxDayEnd } from "@/lib/dates";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const category = searchParams.get("category");

  const memberSpaceIds = (
    await prisma.spaceMember.findMany({ where: { userId }, select: { spaceId: true } })
  ).map((m) => m.spaceId);

  const hasDateFilter = Boolean(from || to);

  const places = await prisma.place.findMany({
    where: {
      spaceId: spaceId ? spaceId : { in: memberSpaceIds },
      ...(category ? { category: category as any } : {}),
      ...(hasDateFilter
        ? {
            visits: {
              some: {
                visitDate: {
                  ...(from ? { gte: cdmxDayStart(from) } : {}),
                  ...(to ? { lte: cdmxDayEnd(to) } : {}),
                },
              },
            },
          }
        : {}),
    },
    include: {
      visits: {
        include: { photos: true, createdBy: true },
        orderBy: { visitDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(places);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { spaceId, name, category, latitude, longitude, description, visitDate, photoUrls } = body;

  const place = await prisma.place.create({
    data: {
      spaceId,
      createdById: userId,
      name,
      category,
      latitude,
      longitude,
      visits: {
        create: {
          createdById: userId,
          description: description || "",
          visitDate: new Date(visitDate),
          photos: { create: (photoUrls || []).map((url: string) => ({ url })) },
        },
      },
    },
    include: { visits: { include: { photos: true, createdBy: true } } },
  });

  return NextResponse.json(place);
}
