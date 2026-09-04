import { Router } from "express";
import { GetRecoveryCase, 
        GetRecoveryCases, 
        ManuallyTriggerRecovery, 
        StopRecovery, 
        ResumeRecovery } from "../../controllers/recovery/recoveryController";
const recoveryRouter = Router()

recoveryRouter.get('get-recovery-case', GetRecoveryCase)
recoveryRouter.get('get-recovery-case', GetRecoveryCases)
recoveryRouter.post('trigger-recovery', ManuallyTriggerRecovery)
recoveryRouter.post('stop-recovery', StopRecovery)
recoveryRouter.post('resume-recovery', ResumeRecovery)

export default recoveryRouter