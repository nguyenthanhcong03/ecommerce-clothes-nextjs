export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class ValidationError extends Error {
  errors: { field: string; message: string }[]

  constructor(errors: { field: string; message: string }[]) {
    super('Validation Error')
    this.errors = errors
  }
}
