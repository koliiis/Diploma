export function isAdmin(role: string | undefined): boolean {
  return role === 'admin'
}

export function isOwnerOrAdmin(
  user: { userId: string; role: string } | undefined,
  ownerId: string,
): boolean {
  if (!user) return false
  return isAdmin(user.role) || user.userId === ownerId
}
