import { Router } from "express";
import { CreateDemoCustomer, CreateCustomerWithoutIssue, CreateCustomerWithIssue } from "../../controllers/demo/demoController";

const demoRoutes = Router()

demoRoutes.post('/create-democustomer', CreateDemoCustomer)
demoRoutes.post('/create-democustomer-wi', CreateCustomerWithIssue)
demoRoutes.post('/create-democustomer-woi', CreateCustomerWithoutIssue)

export default demoRoutes
