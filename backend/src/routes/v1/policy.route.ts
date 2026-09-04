import { Router } from "express";
import { CreatePolicy, GetPolicies, UpdatePolicy, SetPolicyEnabled, DeletePolicy } from "../../controllers/policy/policyController";

const policyRouter = Router()

policyRouter.get('get-policy', GetPolicies)
policyRouter.post('create-policy', CreatePolicy)
policyRouter.patch('update-policy', UpdatePolicy)
policyRouter.post('set-policy', SetPolicyEnabled)
policyRouter.delete('delete-policy', DeletePolicy)

export default policyRouter