export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  return /^\+?[0-9]{7,15}$/.test(phone)
}

export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0
}

export const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value) && value > 0
}

export const isValidObjectIdString = (value: unknown): value is string => {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value)
}

export const requireFields = (body: Record<string, unknown>, fields: string[]): string[] => {
  const missing: string[] = []

  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      missing.push(field)
    }
  }

  return missing
}