import { Request, Response } from "express"
import {
  getCustomers,
  getCustomerDetails,
  deleteCustomer,
} from "../../services/customer/customerService"

export const GetCustomers = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query
    const customers = await getCustomers({ status, search })

    res.status(200).json({
      success: true,
      message: "Customers fetched",
      data: customers,
    })
  } catch (err) {
    console.error("GetCustomers error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const GetCustomerDetails = async (req: Request, res: Response) => {
  try {
    const customerId = String(req.query.customerId)
    const customer = await getCustomerDetails(customerId)

    res.status(200).json({
      success: true,
      message: "Customer details fetched",
      data: customer,
    })
  } catch (err) {
    console.error("GetCustomerDetails error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const DeleteCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = String(req.query.customerId)
    await deleteCustomer(customerId)

    res.status(200).json({
      success: true,
      message: "Customer deleted",
    })
  } catch (err) {
    console.error("DeleteCustomer error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}