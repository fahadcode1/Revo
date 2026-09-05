import { useEffect, useState } from "react";
import StatCard from "../../components/app/cards/StateCard";
import RecoveryRow from "../../components/app/cards/RecoveryRow";
import { useRecoveryCases } from "../../hooks/useRecoveryCases";
import type { RecoveryCase } from "../../components/types/recovery";
import { useNavigate } from "react-router-dom";

type RecoveryStatus = "Recovered" | "Escalated" | "Retrying";

const STATUS_LABELS: Record<string, RecoveryStatus> = {
  open: "Retrying",
  in_progress: "Retrying",
  stopped: "Escalated",
  resolved: "Recovered",
};

export default function HomePage() {
  const navigate = useNavigate();
  const { getCases, loading, error } = useRecoveryCases();
  const [cases, setCases] = useState<RecoveryCase[]>([]);

  useEffect(() => {
    (async () => {
      const result = await getCases();
      setCases(result ?? []);
    })();
  }, []);

  const recentCases = [...cases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 text-white">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">
          Revenue Recovery
        </p>

        <h1 className="text-2xl font-semibold text-white">
          Good morning, Revo is ready.
        </h1>

        <p className="mt-2 text-sm text-[#777]">
          Here's what your recovery agent has handled today.
        </p>
      </div>

      {/* Stats — left as placeholders, analytics comes later */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total processed" value="32" />
        <StatCard label="Recovered" value="19" valueClass="text-green-500" />
        <StatCard label="Escalated" value="8" valueClass="text-red-400" />
        <StatCard label="Amount recovered" value="Rs 24,860" />
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
                    amount={`${c.payment?.currency ?? ""} ${c.payment?.amount ?? 0}`}
                    status={STATUS_LABELS[c.status] ?? "Retrying"}
                    attempts={0}
                    reason={c.problemType}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent status */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-[#292929] bg-[#151515] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <div>
            <p className="text-sm text-white">
              Revo is actively recovering revenue
            </p>
            <p className="mt-1 text-xs text-[#666]">
              Monitoring failed payments and deciding next actions.
            </p>
          </div>
        </div>
        <span className="text-xs text-green-500">Active</span>
      </div>

    </main>
  );
}