import { Router } from "express";
import { GetActiveWorkflows, 
         GetWorkflowDetails, 
         GetWorkflowHistory, 
         StopWorkflow, 
         ResumeWorkflow } from "../../controllers/workflow/workflowController";


const workflowRouter = Router()


workflowRouter.get('get-active-wfs', GetActiveWorkflows)
workflowRouter.get('get-active-wf-detail', GetWorkflowDetails)
workflowRouter.get('get-active-wf-history', GetWorkflowHistory)
workflowRouter.patch('stop-workflow', StopWorkflow)
workflowRouter.patch('resume-workflow', StopWorkflow)


export default workflowRouter