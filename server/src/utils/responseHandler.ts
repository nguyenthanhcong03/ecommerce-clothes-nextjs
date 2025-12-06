import { Response } from 'express'

export const responseHandler = (res: Response, statusCode: number, message: string, data?: any) => {
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data: data || null
  })
}

export const responseSuccess = (res: Response, statusCode: number, message: string, data?: any) => {
  const response: any = {
    success: true,
    message
  }

  if (data !== null && data !== undefined) {
    Object.assign(response, data)
  }

  res.status(statusCode).json(response)
}
