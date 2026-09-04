import { Workflow } from "../../models/Workflow.Model"
import { WorkflowStep } from "../../models/WorkflowStep.Model"

export const createWorkflow = async (data: {
  recoveryCase: string
  workflowType: string
  nextAction: string
}) => {
  const workflow = await Workflow.create({
    ...data,
    status: "pending",
  })

  return workflow
}

export const startWorkflow = async (workflowId: string) => {
  const workflow = await Workflow.findById(workflowId)
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  workflow.status = "in_progress"
  workflow.startedAt = new Date()
  await workflow.save()

  return workflow
}

export const advanceWorkflow = async (workflowId: string, nextStepData: {
  action: string
  scheduledTime?: Date
}) => {
  const workflow = await Workflow.findById(workflowId)
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  const step = await WorkflowStep.create({
    workflow: workflow._id,
    action: nextStepData.action,
    status: "scheduled",
    scheduledTime: nextStepData.scheduledTime,
  })

  workflow.currentStep = step._id
  await workflow.save()

  return { workflow, step }
}

export const completeWorkflow = async (workflowId: string) => {
  const workflow = await Workflow.findById(workflowId)
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  workflow.status = "completed"
  workflow.completedAt = new Date()
  await workflow.save()

  return workflow
}

export const stopWorkflow = async (workflowId: string) => {
  const workflow = await Workflow.findById(workflowId)
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  workflow.status = "stopped"
  await workflow.save()

  return workflow
}

export const resumeWorkflow = async (workflowId: string) => {
  const workflow = await Workflow.findById(workflowId)
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  workflow.status = "in_progress"
  await workflow.save()

  return workflow
}

export const getActiveWorkflows = async (filters: { workflowType?: any }) => {
  const query: Record<string, any> = { status: "in_progress" }

  if (filters.workflowType) {
    query.workflowType = filters.workflowType
  }

  const workflows = await Workflow.find(query).sort({ createdAt: -1 })
  return workflows
}

export const getWorkflowDetails = async (workflowId: string) => {
  const workflow = await Workflow.findById(workflowId).populate("currentStep")
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  return workflow
}

export const getWorkflowHistory = async (workflowId: string) => {
  const steps = await WorkflowStep.find({ workflow: workflowId }).sort({ createdAt: 1 })
  return steps
}