import { Event } from "../../models/Event.Model"
import { receiveEvent, isDuplicateEvent, passEventToRecoveryEngine } from "../event/eventService"

const verifyRazorpaySignature = (payload: Record<string, unknown>, headers: Record<string, any>) => {
  const signature = headers["x-razorpay-signature"]

  if (!signature) {
    throw new Error("Missing Razorpay signature")
  }

  // TODO: compute HMAC using RAZORPAY_WEBHOOK_SECRET and compare with `signature`
  return true
}

const verifyStripeSignature = (payload: Record<string, unknown>, headers: Record<string, any>) => {
  const signature = headers["stripe-signature"]  as string

  if (!signature) {
    throw new Error("Missing Stripe signature")
  }

  // TODO: use stripe SDK's constructEvent with STRIPE_WEBHOOK_SECRET
  return true
}

const convertRazorpayPayloadToEvent = (payload: any) => {
  return {
    eventType: payload.event,
    source: "razorpay",
    payload,
  }
}

const convertStripePayloadToEvent = (payload: any) => {
  return {
    eventType: payload.type,
    source: "stripe",
    payload,
  }
}

export const handleRazorpayWebhook = async (payload: Record<string, unknown>, headers: Record<string, any>) => {
  verifyRazorpaySignature(payload, headers)

  const internalEventData = convertRazorpayPayloadToEvent(payload)

  const duplicate = await isDuplicateEvent(internalEventData)
  if (duplicate) {
    return { status: "duplicate_ignored" }
  }

  const event = await receiveEvent(internalEventData)

  try {
    await passEventToRecoveryEngine(event._id.toString())
    event.processingStatus = "processed"
  } catch (err) {
    event.processingStatus = "failed"
    throw err
  } finally {
    await event.save()
  }

  return { status: "processed", eventId: event._id }
}

export const handleStripeWebhook = async (payload: Record<string, unknown>, headers: Record<string, any>) => {
  verifyStripeSignature(payload, headers)

  const internalEventData = convertStripePayloadToEvent(payload)

  const duplicate = await isDuplicateEvent(internalEventData)
  if (duplicate) {
    return { status: "duplicate_ignored" }
  }

  const event = await receiveEvent(internalEventData)

  try {
    await passEventToRecoveryEngine(event._id.toString())
    event.processingStatus = "processed"
  } catch (err) {
    event.processingStatus = "failed"
    throw err
  } finally {
    await event.save()
  }

  return { status: "processed", eventId: event._id }
}