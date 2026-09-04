import { Request, Response } from "express"
import {
  createPolicy,
  updatePolicy,
  getPolicies,
  setPolicyEnabled,
  deletePolicy,
} from "../../services/policy/policyService"

export const CreatePolicy = async (req: Request, res: Response) => {
  try {
    const { problemType, allowedActions, retryLimits, cooldowns, communicationRules } = req.body
    const policy = await createPolicy({
      problemType,
      allowedActions,
      retryLimits,
      cooldowns,
      communicationRules,
    })

    res.status(200).json({
      success: true,
      message: "Policy created",
      data: policy,
    })
  } catch (err) {
    console.error("CreatePolicy error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const UpdatePolicy = async (req: Request, res: Response) => {
  try {
    const policyId = req.params.policyId as string
    const updates = req.body
    const policy = await updatePolicy(policyId, updates)

    res.status(200).json({
      success: true,
      message: "Policy updated",
      data: policy,
    })
  } catch (err) {
    console.error("UpdatePolicy error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetPolicies = async (req: Request, res: Response) => {
  try {
    const { problemType } = req.query
    const policies = await getPolicies({ problemType })

    res.status(200).json({
      success: true,
      message: "Policies fetched",
      data: policies,
    })
  } catch (err) {
    console.error("GetPolicies error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const SetPolicyEnabled = async (req: Request, res: Response) => {
  try {
    const policyId = req.params.policyId  as string
    const { enabled } = req.body
    const policy = await setPolicyEnabled(policyId, enabled)

    res.status(200).json({
      success: true,
      message: `Policy ${enabled ? "enabled" : "disabled"}`,
      data: policy,
    })
  } catch (err) {
    console.error("SetPolicyEnabled error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const DeletePolicy = async (req: Request, res: Response) => {
  try {
    const policyId = req.params.policyId as string
    await deletePolicy(policyId)

    res.status(200).json({
      success: true,
      message: "Policy deleted",
    })
  } catch (err) {
    console.error("DeletePolicy error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}