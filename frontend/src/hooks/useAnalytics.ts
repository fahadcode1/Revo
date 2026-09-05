import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { DashboardStats } from "../components/types/analytics";

interface DateRangeFilters {
  from?: string;
  to?: string;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardStats = useCallback(
    async (filters?: DateRangeFilters): Promise<DashboardStats | null> => {
      setLoading(true);
      setError(null);
      try {
        const [riskRes, recoveredRes, rateRes, failedRes] = await Promise.all([
          api.get("/get-risked-rev", { params: filters }),
          api.get("/get-rev-recovered", { params: filters }),
          api.get("/get-recovery-rate", { params: filters }),
          api.get("/get-failed-recovery", { params: filters }),
        ]);

        const revenueAtRisk = riskRes.data?.data?.revenueAtRisk ?? 0;
        const revenueRecovered = recoveredRes.data?.data?.revenueRecovered ?? 0;
        const rateData = rateRes.data?.data ?? { total: 0, resolved: 0, recoveryRate: 0 };
        const failedList = failedRes.data?.data ?? [];

        return {
          totalProcessed: rateData.total ?? 0,
          recovered: rateData.resolved ?? 0,
          escalated: Array.isArray(failedList) ? failedList.length : 0,
          amountRecovered: revenueRecovered,
          revenueAtRisk,
          recoveryRatePercent: rateData.recoveryRate ?? 0,
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { getDashboardStats, loading, error };
}