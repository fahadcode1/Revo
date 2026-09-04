import { Router } from "express";
import { GetRevenueAtRisk, 
        GetRevenueRecovered, 
        GetRecoveryRate, 
        GetFailedRecoveries,
        GetActiveRecoveries} from "../../controllers/analytics/analyticsController";

const analyticsRouter = Router()

analyticsRouter.get('get-risked-rev', GetRevenueAtRisk)
analyticsRouter.get('get-recovery-rate', GetRecoveryRate)
analyticsRouter.get('get-failed-recovery', GetFailedRecoveries)
analyticsRouter.get('get-rev-recovered', GetRevenueRecovered)
analyticsRouter.get('get-active-recovery', GetActiveRecoveries)

export default analyticsRouter
