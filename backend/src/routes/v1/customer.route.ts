import { Router } from "express";
import {GetCustomers, GetCustomerDetails, DeleteCustomer } from "../../controllers/customer/customerController";


const customerRoutes = Router()


customerRoutes.get('/get-customers', GetCustomers)
customerRoutes.get('/get-customer-detail', GetCustomerDetails)
customerRoutes.delete('/delete-customer', DeleteCustomer)

export default customerRoutes