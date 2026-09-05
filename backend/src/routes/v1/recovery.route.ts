import { Router } from "express";
import {
  GetRecoveryCase,
  GetRecoveryCases,
  ManuallyTriggerRecovery,
  StopRecovery,
  ResumeRecovery,
  ResolveIssue,
} from "../../controllers/recovery/recoveryController";

const recoveryRouter = Router()

recoveryRouter.post('/recovery-cases/:recoveryCaseId/resolve-issue', ResolveIssue)
recoveryRouter.get('/recovery-cases', GetRecoveryCases)
recoveryRouter.get('/recovery-cases/:recoveryCaseId', GetRecoveryCase)
recoveryRouter.post('/recovery-cases/:recoveryCaseId/trigger', ManuallyTriggerRecovery)
recoveryRouter.post('/recovery-cases/:recoveryCaseId/stop', StopRecovery)
recoveryRouter.post('/recovery-cases/:recoveryCaseId/resume', ResumeRecovery)

export default recoveryRouter