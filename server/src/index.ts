import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectToDatabase } from './config/db'
import { usersRouter } from './routes/users.routes'
import { coursesRouter } from './routes/courses.routes'
import { chatsRouter } from './routes/chats.routes'
import { messagesRouter } from './routes/messages.routes'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/chats', chatsRouter)
app.use('/api/messages', messagesRouter)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'CampusTalk API is running',
  })
})

async function startServer() {
  try {
    await connectToDatabase()

    app.listen(PORT, () => {
      console.log(`Server is running on http://127.0.0.1:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()