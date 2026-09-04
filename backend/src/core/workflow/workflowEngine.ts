import {
  createWorkflow,
  startWorkflow,
  advanceWorkflow,
  completeWorkflow,
  stopWorkflow,
  getWorkflowDetails,
  getWorkflowHistory,
} from "../../services/workflow/workflowService"

export const createWorkflowForCase = async (data: {
  recoveryCaseId: string
  workflowType: string
  nextAction: string
}) => {
  const workflow = await createWorkflow({
    recoveryCase: data.recoveryCaseId,
    workflowType: data.workflowType,
    nextAction: data.nextAction,
  })

  await startWorkflow(workflow._id.toString())

  return workflow
}

export const getCurrentStep = async (workflowId: string) => {
  const workflow = await getWorkflowDetails(workflowId)
  return workflow.currentStep
}

export const moveToNextStep = async (workflowId: string, action: string, scheduledTime?: Date) => {
  return await advanceWorkflow(workflowId, { action, scheduledTime })
}

export const scheduleNextStep = async (workflowId: string, action: string, scheduledTime: Date) => {
  return await moveToNextStep(workflowId, action, scheduledTime)
}

export const completeWorkflowById = async (workflowId: string) => {
  return await completeWorkflow(workflowId)
}

export const stopWorkflowById = async (workflowId: string) => {
  return await stopWorkflow(workflowId)
}

export const handleWorkflowFailure = async (workflowId: string, reason: string) => {
  // TODO: decide if failure should stop or escalate — currently just stops
  const workflow = await stopWorkflow(workflowId)
  return { workflow, reason }
}

export const getHistory = async (workflowId: string) => {
  return await getWorkflowHistory(workflowId)
}