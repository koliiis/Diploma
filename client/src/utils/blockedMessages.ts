export function filterMessagesBeforeBlock<T extends { createdAt: string }>(
  messages: T[],
  isBlocked?: boolean,
  blockedAt?: string,
): T[] {
  if (isBlocked !== true || !blockedAt) return messages

  const cutoff = new Date(blockedAt).getTime()

  return messages.filter(
    (message) => new Date(message.createdAt).getTime() <= cutoff,
  )
}

export function isMessageAfterBlock(
  createdAt: string,
  isBlocked?: boolean,
  blockedAt?: string,
): boolean {
  if (isBlocked !== true || !blockedAt) return false

  return new Date(createdAt).getTime() > new Date(blockedAt).getTime()
}
