import { NextFunction, Request, Response } from 'express'
import { ZodObject } from 'zod'
import { ValidationError } from '@/utils/error'

// Validate middleware with Zod
export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('req.body :>> ', req.body)
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      // gắn lại dữ liệu đã validate
      req.body = parsed.body

      next()
    } catch (error: any) {
      next(error)
    }
  }
}

// // Validate only body
// export const validateBody = (schema: ZodObject) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       req.body = await schema.parseAsync(req.body)
//       next()
//     } catch (error) {
//       if (error instanceof ZodError) {
//         const errors = error.errors.map((err) => ({
//           field: err.path.join('.'),
//           message: err.message
//         }))
//         next(new ValidationError(errors))
//       } else {
//         next(error)
//       }
//     }
//   }
// }

// // Validate only params
// export const validateParams = (schema: ZodObject) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       req.params = await schema.parseAsync(req.params)
//       next()
//     } catch (error) {
//       if (error instanceof ZodError) {
//         const errors = error.errors.map((err) => ({
//           field: err.path.join('.'),
//           message: err.message
//         }))
//         next(new ValidationError(errors))
//       } else {
//         next(error)
//       }
//     }
//   }
// }

// // Validate only query
// export const validateQuery = (schema: ZodObject) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       req.query = await schema.parseAsync(req.query)
//       next()
//     } catch (error) {
//       if (error instanceof ZodError) {
//         const errors = error.errors.map((err) => ({
//           field: err.path.join('.'),
//           message: err.message
//         }))
//         next(new ValidationError(errors))
//       } else {
//         next(error)
//       }
//     }
//   }
// }
