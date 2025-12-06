import { authRequired } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/middlewares/error.middleware'
import { validate } from '@/middlewares/validate.middleware'
import express from 'express'
import { getCurrentUser, login, logout, refreshToken, register } from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schema'

const router = express.Router()

router.post('/register', validate(registerSchema), asyncHandler(register))
router.post('/login', validate(loginSchema), asyncHandler(login))
router.get('/me', authRequired, asyncHandler(getCurrentUser))
router.post('/logout', asyncHandler(logout))
router.post('/refresh-token', asyncHandler(refreshToken))

export default router
