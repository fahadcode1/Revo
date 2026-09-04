import { Customer } from "../../models/Customer.Model"

export const createCustomer = async (data: {
  fullName: string
  email: string
  phone: string
  status: string
}) => {
  const existing = await Customer.findOne({ email: data.email })
  if (existing) {
    throw new Error("Email already exists")
  }

  const customer = await Customer.create(data)
  return customer
}

export const getCustomers = async (filters: { status?: any; search?: any }) => {
  const query: Record<string, any> = {}

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ]
  }

  const customers = await Customer.find(query).sort({ createdAt: -1 })
  return customers
}

export const getCustomerDetails = async (customerId: string) => {
  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new Error("Customer not found")
  }

  return customer
}

export const updateCustomer = async (customerId: string, updates: Partial<{
  fullName: string
  email: string
  phone: string
  status: string
}>) => {
  const customer = await Customer.findByIdAndUpdate(customerId, updates, { new: true })
  if (!customer) {
    throw new Error("Customer not found")
  }

  return customer
}

export const deleteCustomer = async (customerId: string) => {
  const customer = await Customer.findByIdAndDelete(customerId)
  if (!customer) {
    throw new Error("Customer not found")
  }

  return customer
}