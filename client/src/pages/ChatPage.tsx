import { Link, useParams } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useChatMessages } from '../hooks/useChatMessages'
import { useAuthStore } from '../store/authStore'
import { useSocketJoinChat } from '../hooks/useSocketJoinChat'
import { useStickToBottomOnChange } from '../hooks/useStickToBottomOnChange'
import { ChatMessageList } from '../components/chats/ChatMessageList'
import { ChatComposer } from '../components/chats/ChatComposer'

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const currentUser = useAuthStore((s) => s.user)

  useSocketJoinChat(chatId)

  useStickToBottomOnChange(
    messagesRef,
    shouldScrollToBottomRef,
    messages.length,
  )

  const handleLoadEarlier = async () => {
    shouldScrollToBottomRef.current = false
    await loadEarlierMessages()
  }

  const handleSend = async () => {
    await sendMessage(messageText)
    setMessageText('')
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
    }
  }

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col rounded-xl bg-white p-2">
      <div className="border-b px-2 py-3">
        <Link
          to="/dashboard/chats"
          className="text-sm text-gray-600 no-underline hover:text-black"
        >
          ← Back to chats
        </Link>
      </div>

      <ChatMessageList
        messagesRef={messagesRef}
        isLoading={isLoading}
        messages={messages}
        hasMoreMessages={hasMoreMessages}
        isLoadingEarlier={isLoadingEarlier}
        onLoadEarlier={handleLoadEarlier}
        currentUser={currentUser}
      />

      <ChatComposer
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
        isSending={isSending}
        textareaRef={textareaRef}
      />
    </div>
  )
}
