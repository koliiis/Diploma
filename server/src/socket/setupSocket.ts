import type { Server } from 'socket.io'

export function setupSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId)
    })

    socket.on('send-message', (data) => {
      const chatId =
        typeof data.chatId === 'string'
          ? data.chatId
          : data.chatId?._id

      if (!chatId) return

      io.to(chatId).emit('new-message', data)

      io.to(chatId).emit('chat-list-updated', {
        chatId,
        message: data,
      })
    })

    socket.on('edit-message', (message) => {
      const chatId =
        typeof message.chatId === 'string'
          ? message.chatId
          : message.chatId?._id

      if (!chatId) return

      io.to(chatId).emit('message-edited', message)
    })

    socket.on('delete-message', ({ messageId, chatId }) => {
      io.to(chatId).emit('message-deleted', { messageId, chatId })
    })

    socket.on('typing', (chatId: string) => {
      socket.to(chatId).emit('typing')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}
