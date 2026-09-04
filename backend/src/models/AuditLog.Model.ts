import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  customer: Types.ObjectId; // reference to Customer
  recoveryCase: Types.ObjectId; // reference to RecoveryCase
  action: string; // event/action performed
  actor: string; // "system" | "ai" | "user"
  result: string;
  timestamp: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    recoveryCase: { type: Schema.Types.ObjectId, ref: "RecoveryCase", required: true },
    action: { type: String, required: true },
    actor: { type: String, required: true },
    result: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);