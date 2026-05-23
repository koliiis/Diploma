import type { Server } from 'socket.io'
import { UserModel } from '../models/user.model'
import { verifyAccessToken } from '../utils/jwt'
import { isChatParticipant } from '../utils/chatAccess'
import { isAdmin } from '../utils/permissions'

type SocketData = {
  userId: string
  role: string
  isBlocked: boolean
}

export function setupSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token

      if (!token || typeof token !== 'string') {
        return next(new Error('Unauthorized'))
      }

      const decoded = verifyAccessToken(token)

      if (!decoded) {
        return next(new Error('Unauthorized'))
      }

      const userDoc = await UserModel.findById(decoded.userId).select('role isBlocked')

      if (!userDoc) {
        return next(new Error('Unauthorized'))
      }

      socket.data = {
        userId: decoded.userId,
        role: userDoc.role,
        isBlocked: userDoc.isBlocked === true,
      } satisfies SocketData

      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const socketUser = socket.data as SocketData

    console.log('User connected:', socket.id, socketUser.userId)

    socket.on('join-chat', async (chatId: string) => {
      if (!chatId || typeof chatId !== 'string') {
        return
      }

      const allowed = await isChatParticipant(
        socketUser.userId,
        chatId,
        socketUser.role,
      )

      if (!allowed) {
        return
      }

      socket.join(chatId)
    })

    socket.on('typing', (chatId: string) => {
      if (!chatId || typeof chatId !== 'string' || socketUser.isBlocked) {
        return
      }

      socket.to(chatId).emit('typing')
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}
