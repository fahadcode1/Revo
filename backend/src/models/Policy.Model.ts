import mongoose, { Schema, Document } from "mongoose";

export interface IPolicy extends Document {
  enabled : boolean
  problemType: string;
  allowedActions: string[];
  retryLimits: number;
  cooldowns: number; // in minutes
  communicationRules: Record<string, unknown>;
}

const policySchema = new mongoose.Schema<IPolicy>(
  {
    enabled : { type : Boolean, required : true, default: true },
    problemType: { type: String, required: true, unique: true },
    allowedActions: { type: [String], required: true },
    retryLimits: { type: Number, required: true },
    cooldowns: { type: Number, required: true },
    communicationRules: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Policy = mongoose.model<IPolicy>("Policy", policySchema);