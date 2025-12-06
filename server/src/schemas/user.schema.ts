import { z } from 'zod'

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ')
  })
})
