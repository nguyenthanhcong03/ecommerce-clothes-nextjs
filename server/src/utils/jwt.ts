import jwt from 'jsonwebtoken'

interface UserPayload {
  id: number
  role: 'ADMIN' | 'CUSTOMER'
}

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    } as UserPayload,
    process.env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    } as jwt.SignOptions
  )
}

export const generateRefreshToken = (user: Pick<UserPayload, 'id'>): string => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    } as jwt.SignOptions
  )
}
