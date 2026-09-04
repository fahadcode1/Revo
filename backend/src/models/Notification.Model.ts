import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  customer: Types.ObjectId; // reference to Customer
  channel: string;
  message: string;
  status: string;
  sentAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    channel: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);