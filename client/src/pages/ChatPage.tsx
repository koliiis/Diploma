import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useChatMessages } from '../hooks/useChatMessages'
import { useAuthStore } from '../store/authStore'
import { useSocketJoinChat } from '../hooks/useSocketJoinChat'
import { useStickToBottomOnChange } from '../hooks/useStickToBottomOnChange'
import { ChatMessageList } from '../components/chats/ChatMessageList'
import { ChatComposer } from '../components/chats/ChatComposer'
import { getChats, type Chat } from '../api/chats'
import { getChatListDisplay } from '../utils/chatDisplay'

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
    retryMessage,
  } = useChatMessages(chatId)

  const [messageText, setMessageText] = useState('')
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const shouldScrollToBottomRef = useRef(true)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const currentUser = useAuthStore((s) => s.user)
  const isUserNearBottomRef = useRef(true)
  const [chat, setChat] = useState<Chat | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<
  {
    url: string
    name: string
    type: string
  }[]
>([])

  useSocketJoinChat(chatId)

  useEffect(() => {
    async function loadChatTitle() {
      if (!chatId) return

      try {
        const chats = await getChats()
        const currentChat = chats.find((item) => item._id === chatId)
        setChat(currentChat ?? null)
      } catch {
        setChat(null)
      }
    }

    loadChatTitle()
  }, [chatId])

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

    await sendMessage(messageText, selectedFiles)

    setMessageText('')
    setSelectedFiles([])

    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
    }
  }

  const chatDisplay = chat
  ? getChatListDisplay(chat, currentUser?._id)
  : null

  return (
    <div className="flex h-[calc(100vh-112px)] flex-col overflow-hidden rounded-[24px] bg-white shadow-sm lg:h-[calc(100vh-120px)]">
      <div className="flex items-center gap-3 border-b border-b-solid border-gray-100 px-4 py-3">
        <Link
          to="/dashboard/chats"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-solid border-gray-200 bg-white text-gray-600 no-underline hover:bg-gray-50"
        >
          ←
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-[#10182f]">
            {chatDisplay?.title ?? 'Чат'}
          </p>

          <p className="text-xs text-gray-500">
            {chat?.type === 'direct'
              ? 'Приватні повідомлення'
              : chat?.courseId?.groups?.length
                ? `Групи: ${chat.courseId.groups.join(', ')}`
                : 'Навчальний чат'}
          </p>
        </div>
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
        onRetryMessage={retryMessage}
      />

      <ChatComposer
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
        isSending={isSending}
        textareaRef={textareaRef}
        selectedFiles={selectedFiles}
        onFilesChange={setSelectedFiles}
      />
    </div>
  )
}
