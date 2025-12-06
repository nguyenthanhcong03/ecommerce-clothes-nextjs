import app from './app'
import { prisma } from './lib/prisma'

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    console.log('Connected to DB')

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error(err)
  }
}

start()
