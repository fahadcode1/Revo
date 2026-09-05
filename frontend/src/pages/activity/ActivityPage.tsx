import { useState, useEffect } from "react";
import { useRecoveryActivity } from "../../hooks/useRecoveryActivity";
import type { RecoveryActivityEntry } from "../../components/types/activity";
import { FAILURE_REASON_META } from "../../components/types/customer";

export default function ActivityPage() {
  const { getActivity, loading, error } = useRecoveryActivity();
  const [activity, setActivity] = useState<RecoveryActivityEntry[]>([]);

  useEffect(() => {
    (async () => {
      const result = await getActivity();
      setActivity(result ?? []);
    })();
  }, []);

  const totalRecovered = activity.reduce((sum, a) => sum + (a.amountRecovered ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>
        <h1 className="text-2xl font-semibold text-white">Recovery activity</h1>
        <p className="mt-2 text-sm text-[#777]">
          Resolved cases — who was recovered, how much, and how many attempts it took.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#292929] bg-[#151515] p-5">
          <p className="text-xs text-[#666]">Cases resolved</p>
          <p className="mt-1 text-2xl font-semibold text-white">{activity.length}</p>
        </div>
        <div className="rounded-xl border border-[#292929] bg-[#151515] p-5">
          <p className="text-xs text-[#666]">Total amount recovered</p>
          <p className="mt-1 text-2xl font-semibold text-green-500">
            Rs {totalRecovered.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#292929] bg-[#151515]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#292929] text-xs text-[#666]">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount recovered</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    Loading activity…
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

              {!loading && !error && activity.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    No resolved cases yet.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                activity.map((a) => {
                  const reasonMeta = a.problemType ? FAILURE_REASON_META[a.problemType] : null;

                  return (
                    <tr key={a.recoveryCaseId} className="border-b border-[#292929] last:border-0">
                      <td className="px-5 py-3 text-white">
                        <div>{a.customer?.fullName ?? "—"}</div>
                        <div className="text-xs text-[#666]">{a.customer?.email}</div>
                      </td>
                      <td className="px-5 py-3 text-green-500">
                        Rs {a.amountRecovered?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-5 py-3">
                        {a.problemType ? (
                          <span className={reasonMeta?.color ?? "text-[#aaa]"}>
                            {reasonMeta?.label ?? a.problemType}
                          </span>
                        ) : (
                          <span className="text-[#444]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#aaa]">{a.attempts + 1}</td>
                      <td className="px-5 py-3 text-[#aaa]">
                        {a.resolvedAt ? new Date(a.resolvedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}