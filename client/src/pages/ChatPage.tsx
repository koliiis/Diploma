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
    editMessage,
    removeMessage,
  } = useChatMessages(chatId)

  const [messageText, setMessageText] = useState('')
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToBottomRef = useRef(true)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const currentUser = useAuthStore((s) => s.user)
  const isUserNearBottomRef = useRef(true)

  useSocketJoinChat(chatId)

  useStickToBottomOnChange(
    messagesRef,
    shouldScrollToBottomRef,
    isUserNearBottomRef,
    messages.length,
  )

  const isNearBottom = () => {
    const el = messagesRef.current
    if (!el) return true
  
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  
    return distanceFromBottom < 120
  }

  const handleMessagesScroll = () => {
    isUserNearBottomRef.current = isNearBottom()
  }

  const handleLoadEarlier = async () => {
    shouldScrollToBottomRef.current = false
    await loadEarlierMessages()
  }

  const handleDeleteMessage = async (messageId: string) => {
    shouldScrollToBottomRef.current = false
    await removeMessage(messageId)
  }

  const handleSend = async () => {
    shouldScrollToBottomRef.current = true
  
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
          ← Назад до чатів
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
        onEditMessage={editMessage}
        onDeleteMessage={handleDeleteMessage}
        onScroll={handleMessagesScroll}
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
