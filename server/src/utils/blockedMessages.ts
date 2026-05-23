export function getMessageCutoffDate(user: {
  isBlocked: boolean
  blockedAt?: Date
  updatedAt?: Date
}): Date | null {
  if (user.isBlocked !== true) return null
  return user.blockedAt ?? user.updatedAt ?? new Date()
}

export function applyMessageCutoffFilter(
  filter: { createdAt?: Record<string, Date> },
  cutoff: Date | null,
) {
  if (!cutoff) return filter

  filter.createdAt = {
    ...filter.createdAt,
    $lte: cutoff,
  }

  return filter
}
