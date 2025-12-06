import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

transporter.verify((error, success) => {
  if (error) {
    console.error('Error setting up email transporter:', error)
  } else {
    console.log('Email transporter is ready to send messages')
  }
})

const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"Book store" ${process.env.EMAIL_USER}`,
    to,
    subject,
    html
  }
  return transporter.sendMail(mailOptions)
}

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`
  const subject = 'Xác minh email của bạn'
  const html = `
    <p>Vui lòng nhấp vào liên kết bên dưới để xác minh email của bạn:</p>
    <a href="${verificationUrl}">Xác minh Email</a>
    <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
  `
  await sendEmail(to, subject, html)
}

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
  const subject = 'Đặt lại mật khẩu của bạn'
  const html = `
    <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
    <a href="${resetUrl}">Đặt lại Mật khẩu</a>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
  `
  await sendEmail(to, subject, html)
}
