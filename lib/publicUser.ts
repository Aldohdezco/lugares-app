// Campos de un usuario que se pueden mandar al navegador (nunca el passwordHash)
export const publicUser = { select: { id: true, name: true, email: true, avatarUrl: true } } as const;
