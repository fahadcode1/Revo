import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/errorHandler"
import { logger } from "../utils/logger"

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message = err?.message || "Internal server error"

  logger.error(message, { method: req.method, url: req.originalUrl, statusCode })

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