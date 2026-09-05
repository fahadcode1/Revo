import { Router } from "express";
import { GetSettings, SetRecoveryEngineStatus, SetAiStatus } from "../../controllers/settings/settingsController";

const settingRouter = Router()

settingRouter.get('/settings', GetSettings)
settingRouter.post('/set-engine-status', SetRecoveryEngineStatus)
settingRouter.post('/set-ai-status', SetAiStatus)

export default settingRouter