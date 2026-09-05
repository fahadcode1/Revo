import { randomBytes } from "crypto"

export const generateId = (prefix?: string): string => {
  const id = randomBytes(8).toString("hex")
  return prefix ? `${prefix}_${id}` : id
}

export const generateReferenceCode = (): string => {
  const timestampPart = Date.now().toString(36)
  const randomPart = randomBytes(4).toString("hex")
  return `${timestampPart}-${randomPart}`.toUpperCase()
}