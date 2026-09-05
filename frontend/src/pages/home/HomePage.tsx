import { useEffect, useState } from "react";
import StatCard from "../../components/app/cards/StateCard";
import RecoveryRow from "../../components/app/cards/RecoveryRow";
import { useRecoveryCases } from "../../hooks/useRecoveryCases";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useSettings } from "../../hooks/useSettings";
import type { RecoveryCase } from "../../components/types/recovery";
import type { DashboardStats } from "../../components/types/analytics";
import type { Settings } from "../../components/types/settings";
import { useNavigate } from "react-router-dom";

type RecoveryStatus = "Recovered" | "Escalated" | "Retrying";

const STATUS_LABELS: Record<string, RecoveryStatus> = {
  open: "Retrying",
  in_progress: "Retrying",
  failed: "Escalated",
  resolved: "Recovered",
};

export default function HomePage() {
  const navigate = useNavigate();
  const { getCases, loading, error } = useRecoveryCases();
  const { getDashboardStats, loading: statsLoading } = useAnalytics();
  const { getSettings } = useSettings();
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      const [caseResult, statsResult, settingsResult] = await Promise.all([
        getCases(),
        getDashboardStats(),
        getSettings(),
      ]);
      setCases(caseResult ?? []);
      setStats(statsResult);
      setSettings(settingsResult);
    })();
  }, []);

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const aiEnabled = settings?.aiEnabled ?? true;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>

        <h1 className="text-2xl font-semibold text-white">
          Good morning, Revo is ready.
        </h1>

        <p className="mt-2 text-sm text-[#777]">
          Here's what your recovery agent has handled today.
        </p>
      </div>

      {/* AI off banner */}
      {!aiEnabled && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3">
          <div className="h-2 w-2 rounded-full bg-yellow-400" />
          <p className="text-sm text-yellow-300">
            AI agent is currently turned off — customer replies will not be interpreted automatically.
          </p>
          <button
            onClick={() => navigate("/settings")}
            className="ml-auto cursor-pointer text-xs text-yellow-300 underline hover:text-yellow-200"
          >
            Go to settings
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total processed"
          value={statsLoading ? "…" : String(stats?.totalProcessed ?? 0)}
        />

        <StatCard
          label="Recovered"
          value={statsLoading ? "…" : String(stats?.recovered ?? 0)}
          valueClass="text-green-500"
        />

        <StatCard
          label="Escalated"
          value={statsLoading ? "…" : String(stats?.escalated ?? 0)}
          valueClass="text-red-400"
        />

        <StatCard
          label="Amount recovered"
          value={
            statsLoading
              ? "…"
              : `Rs ${(stats?.amountRecovered ?? 0).toLocaleString("en-IN")}`
          }
        />
      </div>

      {/* Recovery overview */}
      <div className="mt-8 rounded-xl border border-[#292929] bg-[#151515]">
        <div className="flex items-center justify-between border-b border-[#292929] px-5 py-4">
          <div>
            <h2 className="text-sm font-medium text-white">
              Recent recovery activity
            </h2>
            <p className="mt-1 text-xs text-[#666]">
              Latest actions taken by Revo
            </p>
          </div>

          <button
            onClick={() => navigate("/recovery")}
            className="cursor-pointer text-xs text-[#888] transition-colors hover:text-white"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#292929] text-xs text-[#666]">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Reason</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    Loading recovery activity…
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && recentCases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    No recovery activity yet.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                recentCases.map((c) => (
                  <RecoveryRow
                    key={c._id}
                    customer={c.customer?.fullName ?? "—"}
                    amount={`${c.payment?.currency ?? "Rs"} ${c.payment?.amount ?? 0}`}
                    status={STATUS_LABELS[c.status] ?? "Retrying"}
                    attempts={0}
                    reason={c.problemType ?? "—"}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent status */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-[#292929] bg-[#151515] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${aiEnabled ? "bg-green-500" : "bg-[#555]"}`} />
          <div>
            <p className="text-sm text-white">
              {aiEnabled ? "Revo is actively recovering revenue" : "Revo's AI agent is turned off"}
            </p>
            <p className="mt-1 text-xs text-[#666]">
              {aiEnabled
                ? "Monitoring failed payments and deciding next actions."
                : "Recovery actions require manual triggers until AI is re-enabled."}
            </p>
          </div>
        </div>

        <span className={`text-xs ${aiEnabled ? "text-green-500" : "text-[#666]"}`}>
          {aiEnabled ? "Active" : "Inactive"}
        </span>
      </div>
    </main>
  );
}