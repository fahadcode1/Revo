export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

import { Request, Response, NextFunction } from "express"

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err?.message || "Internal server error"

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -`, message)

  res.status(statusCode).json({
    success: false,
    message,
  })
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}