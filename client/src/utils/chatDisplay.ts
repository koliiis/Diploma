import type { Chat } from '../api/chats'

export function getChatListDisplay(
  chat: Chat,
  currentUserId: string | undefined,
) {
  const otherParticipant = chat.participantIds.find(
    (p) => p._id !== currentUserId,
  )
  const imageUrl =
    chat.type === 'direct'
      ? otherParticipant?.avatarUrl
      : chat.courseId?.imageUrl
  const title =
    chat.type === 'direct'
      ? `Приватні повідомлення з ${otherParticipant?.fullName ?? 'користувачем'}`
      : chat.courseId?.title ?? chat.title

  return { otherParticipant, imageUrl, title }
}
