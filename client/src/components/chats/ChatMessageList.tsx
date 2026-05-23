import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Message } from '../../api/messages'
import { Avatar } from '../ui/Avatar'
import { formatMessageDate, formatMessageTime } from '../../utils/dateFormat'
import { MessageAttachmentItem } from './MessageAttachmentItem'
import { MoreHorizontal } from 'lucide-react'

type ChatUser = { _id: string; role?: string } | null

type ChatMessageListProps = {
  messagesRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
  isRefreshing?: boolean
  messages: Message[]
  hasMoreMessages: boolean
  isLoadingEarlier: boolean
  onLoadEarlier: () => void
  currentUser: ChatUser
  onEditMessage: (id: string, content: string) => void
  onDeleteMessage: (id: string) => void
  onScroll: () => void
  onRetryMessage: (messageId: string) => void
}

function MessageSkeleton({ isMine }: { isMine: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200" />}
      <div
        className={`h-12 animate-pulse rounded-2xl bg-gray-200 ${
          isMine ? 'w-40' : 'w-52'
        }`}
      />
    </div>
  )
}

export function ChatMessageList({
  messagesRef,
  isLoading,
  isRefreshing = false,
  messages,
  hasMoreMessages,
  isLoadingEarlier,
  onLoadEarlier,
  currentUser,
  onEditMessage,
  onDeleteMessage,
  onScroll,
  onRetryMessage,
}: ChatMessageListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const showEmptyState = !isLoading && messages.length === 0
  const showTopStatus = messages.length > 0 || isLoadingEarlier

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="relative flex-1 overflow-y-auto bg-[#f8fafc] px-3 py-4 sm:px-5"
      ref={messagesRef}
      onScroll={onScroll}
    >
      {isRefreshing && (
        <div className="pointer-events-none sticky top-0 z-10 mb-2 flex justify-center">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs text-gray-500 shadow-sm">
            Оновлення...
          </span>
        </div>
      )}

      {showTopStatus && (
        <div className="mb-2 flex min-h-9 justify-center">
          {hasMoreMessages ? (
            <button
              type="button"
              onClick={onLoadEarlier}
              disabled={isLoadingEarlier}
              className="rounded-full border border-solid border-gray-300 px-4 py-1 text-sm text-gray-600 disabled:opacity-50"
            >
              {isLoadingEarlier ? 'Завантаження...' : 'Попередні повідомлення'}
            </button>
          ) : (
            <p className="py-1 text-sm text-gray-600">Повідомлень більше немає</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {isLoading && messages.length === 0 && (
          <>
            <MessageSkeleton isMine={false} />
            <MessageSkeleton isMine />
            <MessageSkeleton isMine={false} />
          </>
        )}

        {showEmptyState && (
          <div className="flex min-h-40 items-center justify-center">
            <p className="text-sm text-gray-500">Повідомлень ще немає</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.authorId._id === currentUser?._id
          const canManageMessage =
            isMine || currentUser?.role === 'admin'
          const previousMessage = messages[index - 1]
          const shouldShowDateDivider =
            !previousMessage ||
            formatMessageDate(previousMessage.createdAt) !==
              formatMessageDate(msg.createdAt)

          return (
            <div key={msg._id}>
              {shouldShowDateDivider && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                    {formatMessageDate(msg.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`flex items-end gap-2 ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isMine && (
                  <Avatar
                    fullName={msg.authorId.fullName}
                    avatarUrl={msg.authorId.avatarUrl}
                    size="sm"
                  />
                )}

                {canManageMessage && editingId !== msg._id && (
                  <div
                    ref={menuRef}
                    className={`relative mt-1 flex ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === msg._id ? null : msg._id,
                        )
                      }
                      className={`cursor-pointer rounded-full px-2 py-0.5 text-xs opacity-70 ${
                        isMine ? 'hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {openMenuId === msg._id && (
                      <div className="absolute left--3 bottom-full z-20 mb-1 min-w-32 overflow-hidden rounded-xl bg-white py-1 text-sm text-[#10182f] shadow-lg ring-1 ring-black/5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(msg._id)
                            setEditText(msg.content)
                            setOpenMenuId(null)
                          }}
                          className="block w-full cursor-pointer bg-white px-4 py-2 text-left hover:bg-gray-100"
                        >
                          Редагувати
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onDeleteMessage(msg._id)
                            setOpenMenuId(null)
                          }}
                          className="block w-full cursor-pointer bg-white px-4 py-2 text-left text-red-600 hover:bg-red-50"
                        >
                          Видалити
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`
                  max-w-[82%] rounded-2xl px-4 py-2 shadow-sm sm:max-w-md
                  ${
                    isMine
                      ? 'rounded-br-md bg-[#0b67a3] text-white'
                      : 'rounded-bl-md bg-white text-[#10182f]'
                  }
                `}
                >
                  {editingId === msg._id ? (
                    <div className="flex flex-col gap-1">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="rounded border border-solid px-2 py-1 text-sm"
                      />

                      <div className="flex gap-2 text-xs">
                        <p
                          onClick={() => {
                            onEditMessage(msg._id, editText)
                            setEditingId(null)
                          }}
                          className="cursor-pointer"
                        >
                          Зберегти
                        </p>

                        <p
                          onClick={() => setEditingId(null)}
                          className="cursor-pointer text-red-500"
                        >
                          Скасувати
                        </p>
                      </div>
                    </div>
                  ) : msg.content?.trim() ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : null}

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`grid gap-2 ${msg.content?.trim() ? 'mt-2' : ''}`}>
                      {msg.attachments.map((file, fileIndex) => (
                        <MessageAttachmentItem
                          key={`${msg._id}-${fileIndex}-${file.name}`}
                          messageId={msg._id}
                          attachment={file}
                          index={fileIndex}
                          isMine={isMine}
                        />
                      ))}
                    </div>
                  )}

                  {!isMine && (
                    <p className="mt-1 text-xs opacity-70">
                      {msg.authorId.fullName}
                    </p>
                  )}

                  {msg.localStatus === 'pending' && (
                    <p className="text-xs opacity-60">Відправляється...</p>
                  )}

                  {msg.localStatus === 'failed' && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-red-500">
                      <span>Не вдалося відправити ❌</span>

                      <button
                        type="button"
                        onClick={() => onRetryMessage(msg._id)}
                        className="underline"
                      >
                        Повторити
                      </button>
                    </div>
                  )}

                  <p className="mt-1 text-right text-[11px] opacity-60">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
