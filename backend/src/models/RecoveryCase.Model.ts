import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecoveryCase extends Document {
  customer: Types.ObjectId; // reference to Customer
  payment: Types.ObjectId; // reference to Payment
  revenueAtRisk: number;
  problemType: string;
  status: string;
  aiDiagnosis: string;
  currentWorkflow: Types.ObjectId; // reference to Workflow
  resolvedAt: Date;
}

const recoveryCaseSchema = new mongoose.Schema<IRecoveryCase>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    revenueAtRisk: { type: Number, required: true },
    problemType: { type: String, required: true },
    status: { type: String, required: true },
    aiDiagnosis: { type: String, required: false, default: "",},
    currentWorkflow: { type: Schema.Types.ObjectId, ref: "Workflow" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const RecoveryCase = mongoose.model<IRecoveryCase>("RecoveryCase", recoveryCaseSchema);