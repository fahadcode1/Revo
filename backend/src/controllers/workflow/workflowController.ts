import { Request, Response } from "express"
import {
  getActiveWorkflows,
  getWorkflowDetails,
  getWorkflowHistory,
  stopWorkflow,
  resumeWorkflow,
} from "../../services/workflow"

export const GetActiveWorkflows = async (req: Request, res: Response) => {
  try {
    const { workflowType } = req.query
    const workflows = await getActiveWorkflows({ workflowType })

    res.status(200).json({
      success: true,
      message: "Active workflows fetched",
      data: workflows,
    })
  } catch (err) {
    console.error("GetActiveWorkflows error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetWorkflowDetails = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params
    const workflow = await getWorkflowDetails(workflowId)

    res.status(200).json({
      success: true,
      message: "Workflow details fetched",
      data: workflow,
    })
  } catch (err) {
    console.error("GetWorkflowDetails error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetWorkflowHistory = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params
    const history = await getWorkflowHistory(workflowId)

    res.status(200).json({
      success: true,
      message: "Workflow history fetched",
      data: history,
    })
  } catch (err) {
    console.error("GetWorkflowHistory error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const StopWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params
    const result = await stopWorkflow(workflowId)

    res.status(200).json({
      success: true,
      message: "Workflow stopped",
      data: result,
    })
  } catch (err) {
    console.error("StopWorkflow error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const ResumeWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params
    const result = await resumeWorkflow(workflowId)

    res.status(200).json({
      success: true,
      message: "Workflow resumed",
      data: result,
    })
  } catch (err) {
    console.error("ResumeWorkflow error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}