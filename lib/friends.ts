import { prisma } from "./prisma";

// Ids de los usuarios con los que `userId` tiene una amistad aceptada
export async function acceptedFriendIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.friendship.findMany({
    where: { status: "ACEPTADA", OR: [{ requesterId: userId }, { addresseeId: userId }] },
    select: { requesterId: true, addresseeId: true },
  });
  return new Set(rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId)));
}
