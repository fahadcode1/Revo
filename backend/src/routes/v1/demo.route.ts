import { Router } from "express";
import {
  CreateDemoCustomer,
  CreateCustomerWithoutIssue,
  CreateCustomerWithIssue,
  DeleteDemoCustomer,
  SimulatePaymentFailure,
  SimulatePaymentSuccess,
  TriggerRecoveryScenario,
  ResetScenario,
} from "../../controllers/demo/demoController";

const demoRoutes = Router()

demoRoutes.post('/create-democustomer', CreateDemoCustomer)
demoRoutes.post('/create-democustomer-wi', CreateCustomerWithIssue)
demoRoutes.post('/create-democustomer-woi', CreateCustomerWithoutIssue)
demoRoutes.delete('/delete-democustomer', DeleteDemoCustomer)
demoRoutes.post('/simulate-payment-failure', SimulatePaymentFailure)
demoRoutes.post('/simulate-payment-success', SimulatePaymentSuccess)
demoRoutes.post('/trigger-recovery-scenario', TriggerRecoveryScenario)
demoRoutes.post('/reset-scenario', ResetScenario)

export default demoRoutes