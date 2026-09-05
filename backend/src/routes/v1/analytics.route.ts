import { Router } from "express";
import { GetRevenueAtRisk, 
        GetRevenueRecovered, 
        GetRecoveryRate, 
        GetFailedRecoveries,
        GetRecoveryActivity,
        GetActiveRecoveries} from "../../controllers/analytics/analyticsController";

const analyticsRouter = Router()

analyticsRouter.get('/get-risked-rev', GetRevenueAtRisk)
analyticsRouter.get('/get-recovery-rate', GetRecoveryRate)
analyticsRouter.get('/get-failed-recovery', GetFailedRecoveries)
analyticsRouter.get('/get-rev-recovered', GetRevenueRecovered)
analyticsRouter.get('/get-active-recovery', GetActiveRecoveries)
analyticsRouter.get('/analytics/recovery-activity', GetRecoveryActivity)

export default analyticsRouter
