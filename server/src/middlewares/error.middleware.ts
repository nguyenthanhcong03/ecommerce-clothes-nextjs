import { Request, Response, NextFunction } from 'express'
import { AppError, ValidationError } from '../utils/error'

interface ErrorResponse {
  success: false
  message: string
  errors?: any
  stack?: string
}

// Error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let message = 'Internal Server Error'
  let errors: any = undefined

  // AppError - Custom application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  }
  // ValidationError - Validation errors
  else if (err instanceof ValidationError) {
    statusCode = 400
    message = 'Validation Error'
    errors = err.errors
  }
  // Default error
  else {
    message = err.message || message
  }

  const response: ErrorResponse = {
    success: false,
    message
  }

  if (errors) {
    response.errors = errors
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
    console.error('Error:', err)
  }

  res.status(statusCode).json(response)
}

// Not found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, `Route ${req.originalUrl} not found`)
  next(error)
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
