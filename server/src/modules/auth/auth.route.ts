import { authRequired } from '@/middlewares/auth.middleware'
import { asyncHandler } from '@/middlewares/error.middleware'
import express from 'express'
import { getCurrentUser, login, logout, refreshToken, register } from './auth.controller'

const router = express.Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.get('/me', authRequired, asyncHandler(getCurrentUser))
router.post('/logout', asyncHandler(logout))
router.post('/refresh-token', asyncHandler(refreshToken))

export default router
