import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectToDatabase } from './config/db'
import { UserModel } from './models/user.model'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'CampusTalk API is running',
  })
})

app.get('/api/users', async (_req, res) => {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 })
  
      res.json(users)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  })

app.post('/api/users', async (req, res) => {
    try {
      const user = await UserModel.create({
        fullName: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'student',
      })
  
      res.json(user)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to create user' })
    }
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