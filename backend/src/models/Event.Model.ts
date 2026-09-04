import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  eventType: string;
  source: string;
  payload: Record<string, unknown>;
  processingStatus: string;
  timestamp: Date;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    eventType: { type: String, required: true },
    source: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    processingStatus: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);