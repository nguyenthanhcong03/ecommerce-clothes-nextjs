import { Response } from 'express'

// export const responseHandler = (res: Response, statusCode: number, message: string, data?: any) => {
//   res.status(statusCode).json({
//     success: statusCode >= 200 && statusCode < 300,
//     message,
//     data: data || null
//   })
// }

export const responseHandler = (res: Response, statusCode = 200, message = 'OK', data: any = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

// export const responseHandler = {
//   success<T>(res: Response, data: T | null, message = 'OK', statusCode = 200) {
//     return res.status(statusCode).json({
//       success: true,
//       message,
//       data
//     })
//   },

//   error(res: Response, message = 'Error', statusCode = 400) {
//     return res.status(statusCode).json({
//       success: false,
//       message
//     })
//   }
// }

// export const responseHandler = (res: Response, statusCode: number, message: string, data?: any) => {
//   const response: any = {
//     success: true,
//     message
//   }

//   if (data !== null && data !== undefined) {
//     Object.assign(response, data)
//   }

//   res.status(statusCode).json(response)
// }
