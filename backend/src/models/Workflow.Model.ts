import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkflow extends Document {
  recoveryCase: Types.ObjectId; // reference to RecoveryCase
  workflowType: string;
  status: string;
  currentStep: Types.ObjectId; // reference to WorkflowStep
  nextAction: string;
  startedAt: Date;
  completedAt: Date;
}

const workflowSchema = new mongoose.Schema<IWorkflow>(
  {
    recoveryCase: { type: Schema.Types.ObjectId, ref: "RecoveryCase", required: true },
    workflowType: { type: String, required: true },
    status: { type: String, required: true },
    currentStep: { type: Schema.Types.ObjectId, ref: "WorkflowStep" },
    nextAction: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Workflow = mongoose.model<IWorkflow>("Workflow", workflowSchema);