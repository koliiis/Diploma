import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useChatMessages } from '../hooks/useChatMessages'
import { useAuthStore } from '../store/authStore'
import { Avatar } from '../components/ui/Avatar'

export function ChatPage() {
  const { chatId } = useParams()
  return <ChatPageView key={chatId} chatId={chatId} />
}

function ChatPageView({ chatId }: { chatId: string | undefined }) {
  const {
    messages,
    isLoading,
    isSending,
    isLoadingEarlier,
    hasMoreMessages,
    sendMessage,
    loadEarlierMessages,
  } = useChatMessages(chatId)

  const [messageText, setMessageText] = useState('')
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToBottomRef = useRef(true)
  const currentUser = useAuthStore((s) => s.user)

  const handleLoadEarlier = async () => {
    shouldScrollToBottomRef.current = false
    await loadEarlierMessages()
  }

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
  
    if (shouldScrollToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  
    shouldScrollToBottomRef.current = true
  }, [messages.length])

  const handleSend = async () => {
    await sendMessage(messageText)
    setMessageText('')
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col rounded-xl p-2 bg-white">
      <div className="border-b px-2 py-3">
        <Link
          to="/dashboard/chats"
          className="text-sm text-gray-600 no-underline hover:text-black"
        >
          ← Back to chats
        </Link>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 py-4" ref={messagesRef}>
        {isLoading && <p>Loading...</p>}

        {hasMoreMessages && !isLoading && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleLoadEarlier}
              disabled={isLoadingEarlier}
              className="rounded-full border-solid border-gray-300 px-4 py-1 text-sm text-gray-600 disabled:opacity-50"
            >
              {isLoadingEarlier ? 'Loading...' : 'Load earlier'}
            </button>
          </div>
        )}

        {!hasMoreMessages && (
          <div className="flex justify-center pb-2">
            <p className="text-sm text-gray-600">No more messages</p>
          </div>
        )}

        {!isLoading &&
          messages.map((msg) => {
            const isMine = msg.authorId._id === currentUser?._id

            return (
              <div
                key={msg._id}
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

                <div
                  className={`
                    max-w-xs rounded-2xl px-4 shadow-sm
                    ${
                      isMine
                        ? 'rounded-br-md bg-black text-white'
                        : 'rounded-bl-md bg-gray-200 text-gray-900'
                    }
                  `}
                >
                  <p>{msg.content}</p>

                  {!isMine && (
                    <p className="mt-1 text-xs opacity-70">
                      {msg.authorId.fullName}
                    </p>
                  )}

                  {msg.localStatus === 'pending' && (
                    <p className="text-xs opacity-60">Відправляється...</p>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      <div className="flex gap-2 border-t p-3">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Напишіть повідомлення..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        />

        <button
          onClick={handleSend}
          disabled={isSending || !messageText.trim()}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}