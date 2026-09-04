import { Router } from "express";
import { SetRecoveryEngineStatus, SetAiStatus } from "../../controllers/settings/settingsController";


const settingRouter = Router()


settingRouter.post('set-engine-status', SetRecoveryEngineStatus)
settingRouter.post('set-ai-status', SetAiStatus)

export default settingRouter