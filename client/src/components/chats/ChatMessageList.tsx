import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Message } from '../../api/messages'
import { Avatar } from '../ui/Avatar'
import { formatMessageDate, formatMessageTime } from '../../utils/dateFormat'
import { MoreHorizontal } from 'lucide-react'

type ChatUser = { _id: string } | null

type ChatMessageListProps = {
  messagesRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
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

export function ChatMessageList({
  messagesRef,
  isLoading,
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
      className="flex-1 space-y-2 overflow-y-auto bg-[#f8fafc] px-3 py-4 sm:px-5"
      ref={messagesRef}
      onScroll={onScroll}
    >
      {isLoading && <p>Завантаження...</p>}

      {hasMoreMessages && !isLoading && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={onLoadEarlier}
            disabled={isLoadingEarlier}
            className="rounded-full border border-gray-300 px-4 py-1 text-sm text-gray-600 disabled:opacity-50"
          >
            {isLoadingEarlier ? 'Завантаження...' : 'Попередні повідомлення'}
          </button>
        </div>
      )}

      {!hasMoreMessages && (
        <div className="flex justify-center pb-2">
          <p className="text-sm text-gray-600">Повідомлень більше немає</p>
        </div>
      )}

      {!isLoading &&
        messages.map((msg, index) => {
          const isMine = msg.authorId._id === currentUser?._id
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

                {isMine && editingId !== msg._id && (
                  <div
                    ref={menuRef}
                    className="relative mt-1 flex justify-end"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === msg._id ? null : msg._id,
                        )
                      }
                      className="cursor-pointer rounded-full px-2 py-0.5 text-xs opacity-70 hover:bg-white/20"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {openMenuId === msg._id && (
                      <div className="absolute right-0 bottom-full z-20 mb-1 min-w-32 overflow-hidden rounded-xl bg-white py-1 text-sm text-[#10182f] shadow-lg ring-1 ring-black/5">
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
                        className="rounded border px-2 py-1 text-sm"
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
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {msg.attachments.map((file) =>
                        file.type.startsWith('image/') ? (
                          <img
                            key={file.url}
                            src={file.url}
                            alt={file.name}
                            className="max-h-60 rounded-lg object-cover"
                          />
                        ) : (
                          <a
                            key={file.url}
                            href={file.url}
                            download={file.name}
                            className="text-sm underline"
                          >
                            {file.name}
                          </a>
                        ),
                      )}
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
  )
}
