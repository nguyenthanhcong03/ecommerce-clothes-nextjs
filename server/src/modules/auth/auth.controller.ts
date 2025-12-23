import { prisma } from '@/lib/prisma'
import { AppError, ValidationError } from '@/utils/error'
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt'
import { responseHandler } from '@/utils/responseHandler'
import bcrypt from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body

  // Kiểm tra email và phone tồn tại
  const existedErrors: ValidationError['errors'] = []

  const existedEmail = await prisma.user.findUnique({ where: { email } })
  if (existedEmail) existedErrors.push({ field: 'email', message: 'Email đã tồn tại' })

  const existedPhone = await prisma.user.findUnique({ where: { phone } })
  if (existedPhone) existedErrors.push({ field: 'phone', message: 'Số điện thoại đã tồn tại' })

  if (existedErrors.length > 0) {
    throw new ValidationError(existedErrors)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true
    }
  })

  responseHandler(res, 201, 'Đăng ký tài khoản thành công', user)
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      avatar: { select: { url: true, publicId: true } }
    }
  })
  if (!user) {
    throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác')
  }

  const userPayload = {
    id: user.id,
    role: user.role
  }

  // Tạo tokens
  const accessToken = generateAccessToken(userPayload)
  const refreshToken = generateRefreshToken(userPayload)

  // Lưu accessToken vào cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRES)
  })

  // Lưu refreshToken vào cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
    maxAge: Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRES)
  })

  // Loại bỏ password khỏi user trước khi gửi response
  const { password: _, ...userResponse } = user
  responseHandler(res, 200, 'Đăng nhập thành công', {
    user: userResponse,
    accessToken,
    refreshToken
  })
}

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id
  if (!userId) throw new AppError(401, 'Vui lòng đăng nhập để tiếp tục')

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    omit: {
      password: true
    }
  })
  if (!user) throw new AppError(404, 'Không tìm thấy người dùng')

  responseHandler(res, 200, 'Lấy thông tin người dùng thành công', user)
}

export const logout = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = req.cookies
  console.log('accessToken :>> ', accessToken)
  console.log('refreshToken :>> ', refreshToken)

  // Xoá cookie
  res.clearCookie('accessToken', {
    httpOnly: true
  })
  res.clearCookie('refreshToken', {
    httpOnly: true
  })

  console.log('req.cookies :>> ', req.cookies)
  responseHandler(res, 200, 'Đăng xuất thành công')
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) throw new AppError(401, 'Không tìm thấy refresh token')
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { id: number; role: string }

  // Tìm user
  const user = await prisma.user.findUnique({ where: { id: decoded.id } })
  if (!user) throw new AppError(401, 'Token không hợp lệ')

  // Tạo access token mới
  const userPayload = {
    id: user.id,
    role: user.role
  }
  const newAccessToken = generateAccessToken(userPayload)

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    maxAge: Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRES)
    // sameSite: "Strict",
    // secure: true,
  })

  responseHandler(res, 200, 'Làm mới token thành công', newAccessToken)
}
