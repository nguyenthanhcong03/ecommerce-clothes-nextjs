import { NextFunction, Request, Response } from 'express'
import { ZodObject } from 'zod'
import { ValidationError } from '@/utils/error'

// Validate middleware with Zod
export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error: any) {
      const zodErrors: {
        field: string
        message: string
      }[] = []
      error.errors.forEach((err: any) => {
        const field = err.path.join('.')
        zodErrors.push({ field, message: err.message })
      })
      next(new ValidationError(zodErrors))
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
