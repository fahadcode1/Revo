import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkflowStep extends Document {
  workflow: Types.ObjectId; // reference to Workflow
  action: string;
  status: string;
  scheduledTime: Date;
  executedTime: Date;
  result: string;
}

const workflowStepSchema = new mongoose.Schema<IWorkflowStep>(
  {
    workflow: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
    action: { type: String, required: true },
    status: { type: String, required: true },
    scheduledTime: { type: Date },
    executedTime: { type: Date },
    result: { type: String },
  },
  { timestamps: true }
);

export const WorkflowStep = mongoose.model<IWorkflowStep>("WorkflowStep", workflowStepSchema);