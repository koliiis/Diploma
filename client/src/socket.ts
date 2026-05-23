import { io } from 'socket.io-client'
import { API_URL } from './config/api'

export const socket = io(API_URL, {
  autoConnect: false,
})

export function connectSocket(token: string) {
  socket.auth = { token }

  if (socket.connected) {
    socket.disconnect()
  }

  socket.connect()
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect()
  }
}
