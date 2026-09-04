import { useState, useEffect, useCallback } from "react";
import { useRecoveryCases } from "../../hooks/useRecoveryCases";
import { useRecoveryActions } from "../../hooks/useRecoveryActions";
import type { RecoveryCase } from "../../components/types/recovery";
import { FAILURE_REASON_META } from "../../components/types/customer";

export default function RecoveryPage() {
  const { getCases, loading, error } = useRecoveryCases();
  const { triggerRecovery, stopRecovery, resumeRecovery, loading: actionLoading } =
    useRecoveryActions();

  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [status, setStatus] = useState("");
  const [problemType, setProblemType] = useState("");
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    const result = await getCases({
      status: status || undefined,
      problemType: problemType || undefined,
    });
    setCases(result ?? []);
  }, [status, problemType]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleAction = async (
    action: "trigger" | "stop" | "resume",
    caseId: string
  ) => {
    setActingOn(caseId);
    if (action === "trigger") await triggerRecovery(caseId, { workflowType: "default" });
    if (action === "stop") await stopRecovery(caseId);
    if (action === "resume") await resumeRecovery(caseId);
    setActingOn(null);
    loadCases();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>
        <h1 className="text-2xl font-semibold text-white">Recovery cases</h1>
        <p className="mt-2 text-sm text-[#777]">
          Active and past recovery attempts handled by Revo.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#292929] bg-[#151515] px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="retrying">Retrying</option>
          <option value="recovered">Recovered</option>
          <option value="escalated">Escalated</option>
          <option value="stopped">Stopped</option>
        </select>

        <select
          value={problemType}
          onChange={(e) => setProblemType(e.target.value)}
          className="rounded-lg border border-[#292929] bg-[#151515] px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All problem types</option>
          <option value="insufficient_funds">Insufficient funds</option>
          <option value="card_expired">Card expired</option>
          <option value="bank_declined">Bank declined</option>
          <option value="network_error">Network error</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#292929] bg-[#151515]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#292929] text-xs text-[#666]">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-[#666]">
                    Loading recovery cases…
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-[#666]">
                    No recovery cases found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                cases.map((c) => {
                  const reasonMeta = c.problemType ? FAILURE_REASON_META[c.problemType] : null;
                  const busy = actingOn === c.id || actionLoading;

                  return (
                    <tr key={c.id} className="border-b border-[#292929] last:border-0">
                      <td className="px-5 py-3 text-white">{c.customerName ?? "—"}</td>
                      <td className="px-5 py-3 text-[#aaa]">
                        {c.amount !== undefined ? `Rs ${c.amount}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-[#aaa] capitalize">{c.status}</td>
                      <td className="px-5 py-3 text-[#aaa]">
                        {c.attemptCount ?? 0}
                        {c.maxAttempts ? ` / ${c.maxAttempts}` : ""}
                      </td>
                      <td className="px-5 py-3">
                        {c.problemType ? (
                          <span className={reasonMeta?.color ?? "text-[#aaa]"}>
                            {reasonMeta?.label ?? c.problemType}
                          </span>
                        ) : (
                          <span className="text-[#444]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          {(c.status === "stopped" || c.status === "escalated") && (
                            <button
                              disabled={busy}
                              onClick={() => handleAction("resume", c.id)}
                              className="cursor-pointer text-xs text-green-500 hover:text-green-400 disabled:opacity-50"
                            >
                              Resume
                            </button>
                          )}
                          {c.status === "retrying" && (
                            <button
                              disabled={busy}
                              onClick={() => handleAction("stop", c.id)}
                              className="cursor-pointer text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              Stop
                            </button>
                          )}
                          {c.status === "pending" && (
                            <button
                              disabled={busy}
                              onClick={() => handleAction("trigger", c.id)}
                              className="cursor-pointer text-xs text-white hover:text-[#ccc] disabled:opacity-50"
                            >
                              Trigger
                            </button>
                          )}
                        </div>
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