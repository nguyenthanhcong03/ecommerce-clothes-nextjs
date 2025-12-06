import express from 'express'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' })
})

// 404 handler - phải đặt sau tất cả routes
app.use(notFoundHandler)

// Error handler - phải đặt cuối cùng
app.use(errorHandler)

export default app
