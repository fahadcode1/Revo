import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  customer: Types.ObjectId; // reference to Customer
  recoveryCase: Types.ObjectId; // reference to RecoveryCase
  sender: string; // "AI" | "CUSTOMER" | "SYSTEM"
  channel: string; // "email" | "whatsapp" | "in_app"
  content: string;
  messageType: string; // e.g. "recovery_prompt", "reply", "resolution_note"
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    recoveryCase: { type: Schema.Types.ObjectId, ref: "RecoveryCase", required: true },
    sender: { type: String, required: true },
    channel: { type: String, required: true },
    content: { type: String, required: true },
    messageType: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);