import type { Message } from '../api/messages'

export function mergeMessagesByIdChronological(
  a: Message[],
  b: Message[],
): Message[] {
  return [...a, ...b]
    .filter(
      (msg, index, self) =>
        index === self.findIndex((m) => m._id === msg._id),
    )
    .sort(
      (x, y) =>
        new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
    )
}
