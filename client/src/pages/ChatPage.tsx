import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useChatMessages } from '../hooks/useChatMessages'

export function ChatPage() {
  const { chatId } = useParams()
  const { messages, isLoading, isSending, sendMessage } =
    useChatMessages(chatId)

  const [messageText, setMessageText] = useState('')

  const handleSend = async () => {
    await sendMessage(messageText)
    setMessageText('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Chat</h1>

      <div className="mt-4 flex gap-2">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 border px-4 py-2"
        />

        <button
          onClick={handleSend}
          disabled={isSending || !messageText.trim()}
        >
          Send
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p>Loading...</p>}

        {messages.map((msg) => (
          <div key={msg._id}>
            <p>{msg.content}</p>

            {msg.localStatus === 'pending' && <p>Відправляється...</p>}
            {msg.localStatus === 'sent' && <p>Надіслано</p>}
          </div>
        ))}
      </div>
    </div>
  )
}