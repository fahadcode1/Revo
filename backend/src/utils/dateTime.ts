export const minutesFromNow = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000)
}

export const hoursFromNow = (hours: number): Date => {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now()
}

export const isFuture = (date: Date): boolean => {
  return date.getTime() > Date.now()
}

export const minutesBetween = (start: Date, end: Date): number => {
  return Math.round((end.getTime() - start.getTime()) / (60 * 1000))
}

export const toISODateOnly = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

export const formatReadable = (date: Date): string => {
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}