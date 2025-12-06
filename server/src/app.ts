import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

const app = express()
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  })
)
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' })
})

// 404 handler - phải đặt sau tất cả routes
app.use(notFoundHandler)

// Error handler - phải đặt cuối cùng
app.use(errorHandler)

export default app
