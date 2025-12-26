import { z } from 'zod'

export const registerSchema = z
  .object({
    body: z.object({
      fullName: z.string().min(1, 'Tên bắt buộc'),
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
      confirmPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự')
    })
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    path: ['body.confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp'
  })

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự')
  })
})
