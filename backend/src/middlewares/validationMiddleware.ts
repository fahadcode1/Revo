import { Request, Response, NextFunction } from "express"
import { requireFields } from "../utils/validation"
import { AppError } from "../utils/errorHandler"

export const validateBody = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requireFields(req.body, fields)

    if (missing.length > 0) {
      return next(new AppError(`Missing required fields: ${missing.join(", ")}`, 400))
    }

    next()
  }
}

export const validateQuery = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requireFields(req.query as Record<string, unknown>, fields)

    if (missing.length > 0) {
      return next(new AppError(`Missing required query params: ${missing.join(", ")}`, 400))
    }

    next()
  }
}