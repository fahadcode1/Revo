import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  recoveryEngineEnabled: boolean;
  aiEnabled: boolean;
}

const settingsSchema = new mongoose.Schema<ISettings>(
  {
    recoveryEngineEnabled: { type: Boolean, required: true, default: true },
    aiEnabled: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);