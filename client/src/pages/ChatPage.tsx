import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createMessage, getMessages, type Message } from '../api/messages'

export function ChatPage() {
  const { chatId } = useParams()

  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  async function loadMessages() {
    if (!chatId) return

    const data = await getMessages(chatId)
    setMessages(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadMessages()
  }, [chatId])

  const handleSend = async () => {
    if (!chatId) return

    const trimmedText = messageText.trim()

    if (!trimmedText) return

    try {
      setIsSending(true)

      await createMessage({
        chatId,
        content: trimmedText,
      })

      setMessageText('')
      await loadMessages()
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Chat
      </h1>

      <div className="mt-4 flex gap-2">
        <input
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Напишіть повідомлення..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        />

        <button
          onClick={handleSend}
          disabled={isSending || !messageText.trim()}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p>Loading...</p>}

        {!isLoading &&
          messages.map((msg) => (
            <div
              key={msg._id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p>{msg.content}</p>

              <p className="mt-2 text-xs text-gray-500">
                {msg.authorId.fullName}
              </p>
            </div>
          ))}
      </div>
    </div>
  )
}