import { Event } from "../../models/Event.Model"

export const receiveEvent = async (data: {
  eventType: string
  source: string
  payload: Record<string, unknown>
}) => {
  const event = await Event.create({
    ...data,
    processingStatus: "pending",
    timestamp: new Date(),
  })

  return event
}

export const validateEvent = async (event: {
  eventType?: string
  source?: string
  payload?: Record<string, unknown>
}) => {
  if (!event.eventType || !event.source || !event.payload) {
    throw new Error("Invalid event: missing required fields")
  }

  return true
}

export const isDuplicateEvent = async (data: { eventType: string; source: string; payload: Record<string, unknown> }) => {
  const existing = await Event.findOne({
    eventType: data.eventType,
    source: data.source,
    "payload.id": (data.payload as any)?.id,
  })

  return !!existing
}

export const passEventToRecoveryEngine = async (eventId: string) => {
  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error("Event not found")
  }

  // TODO: hand off to recoveryService based on event.eventType
  event.processingStatus = "processed"
  await event.save()

  return event
}