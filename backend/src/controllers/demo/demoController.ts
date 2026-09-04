import { Request, Response } from "express"
import {
  createDemoCustomer,
  deleteDemoCustomer,
  createCustomerWithIssue,
  createCustomerWithoutIssue,
  createDemoPayment,
  simulatePaymentFailure,
  simulatePaymentSuccess,
  triggerRecoveryScenario,
  resetScenario,
} from "../../services/demo/DemoService"

export const CreateDemoCustomer = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, status } = req.body
    const customer = await createDemoCustomer({ fullName, email, phone, status })

    res.status(200).json({
      success: true,
      message: "Demo customer created",
      data: customer,
    })
  } catch (err) {
    console.error("CreateDemoCustomer error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const DeleteDemoCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = String(req.query.customerId)
    await deleteDemoCustomer(customerId)

    res.status(200).json({
      success: true,
      message: "Demo customer deleted",
    })
  } catch (err) {
    console.error("DeleteDemoCustomer error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const CreateCustomerWithIssue = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, issueType, amount, currency, provider, failureReason } = req.body
    const customer = await createCustomerWithIssue({
      fullName,
      email,
      phone,
      issueType,
      amount,
      currency,
      provider,
      failureReason,
    })

    res.status(200).json({
      success: true,
      message: "Customer with issue created",
      data: customer,
    })
  } catch (err) {
    console.error("CreateCustomerWithIssue error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const CreateCustomerWithoutIssue = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone } = req.body
    const customer = await createCustomerWithoutIssue({ fullName, email, phone })

    res.status(200).json({
      success: true,
      message: "Customer without issue created",
      data: customer,
    })
  } catch (err) {
    console.error("CreateCustomerWithoutIssue error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const CreateDemoPayment = async (req: Request, res: Response) => {
  try {
    const { customerId, amount, currency, provider } = req.body
    const payment = await createDemoPayment({ customerId, amount, currency, provider })

    res.status(200).json({
      success: true,
      message: "Demo payment created",
      data: payment,
    })
  } catch (err) {
    console.error("CreateDemoPayment error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const SimulatePaymentFailure = async (req: Request, res: Response) => {
  try {
    const { paymentId, failureReason } = req.body
    const payment = await simulatePaymentFailure({ paymentId, failureReason })

    res.status(200).json({
      success: true,
      message: "Payment failure simulated",
      data: payment,
    })
  } catch (err) {
    console.error("SimulatePaymentFailure error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const SimulatePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body
    const payment = await simulatePaymentSuccess(paymentId)

    res.status(200).json({
      success: true,
      message: "Payment success simulated",
      data: payment,
    })
  } catch (err) {
    console.error("SimulatePaymentSuccess error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const TriggerRecoveryScenario = async (req: Request, res: Response) => {
  try {
    const { recoveryCaseId, scenarioType } = req.body
    const result = await triggerRecoveryScenario({ recoveryCaseId, scenarioType })

    res.status(200).json({
      success: true,
      message: "Recovery scenario triggered",
      data: result,
    })
  } catch (err) {
    console.error("TriggerRecoveryScenario error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const ResetScenario = async (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.body
    await resetScenario(scenarioId)

    res.status(200).json({
      success: true,
      message: "Scenario reset",
    })
  } catch (err) {
    console.error("ResetScenario error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}