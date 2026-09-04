import { Notification } from "../../models/Notification.Model"

export const sendEmail = async (data: { customer: string; message: string }) => {
  const notification = await Notification.create({
    customer: data.customer,
    channel: "email",
    message: data.message,
    status: "pending",
  })

  // TODO: integrate actual email provider (SES/SendGrid/etc)
  notification.status = "sent"
  notification.sentAt = new Date()
  await notification.save()

  return notification
}

export const sendWhatsApp = async (data: { customer: string; message: string }) => {
  const notification = await Notification.create({
    customer: data.customer,
    channel: "whatsapp",
    message: data.message,
    status: "pending",
  })

  // TODO: integrate actual WhatsApp provider (Twilio/Meta Cloud API/etc)
  notification.status = "sent"
  notification.sentAt = new Date()
  await notification.save()

  return notification
}