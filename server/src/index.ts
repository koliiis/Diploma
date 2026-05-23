import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectToDatabase } from './config/db'
import { authRouter } from './routes/auth.routes'
import { chatsRouter } from './routes/chats.routes'
import { coursesRouter } from './routes/courses.routes'
import { messagesRouter } from './routes/messages.routes'
import { usersRouter } from './routes/users.routes'
import { setupSocket } from './socket/setupSocket'
import { setIo } from './socket/ioInstance'
import { adminRouter } from './routes/admin.routes'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 20 * 1024 * 1024,
})

app.use(cors())
app.use(express.json({ limit: '20mb' }))

app.use('/api/auth', authRouter)
app.use('/api/chats', chatsRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'CampusTalk API is running',
  })
})

setIo(io)
setupSocket(io)

async function startServer() {
  try {
    await connectToDatabase()

    server.listen(PORT, () => {
      console.log(`Server is running on http://127.0.0.1:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()