import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoveryCases } from "../../hooks/useRecoveryCases";
import { useRecoveryActions } from "../../hooks/useRecoveryActions";
import type { RecoveryCase } from "../../components/types/recovery";
import { FAILURE_REASON_META } from "../../components/types/customer";

const RESOLUTION_REASONS = [
  { value: "card_updated", label: "Card updated" },
  { value: "balance_added", label: "Balance added" },
  { value: "payment_method_changed", label: "Payment method changed" },
  { value: "customer_resolved", label: "Customer resolved" },
  { value: "other", label: "Other" },
];

export default function RecoveryPage() {
  const navigate = useNavigate();
  const { getCases, loading, error } = useRecoveryCases();
  const {
    triggerRecovery,
    stopRecovery,
    resumeRecovery,
    resolveIssue,
    loading: actionLoading,
  } = useRecoveryActions();

  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [status, setStatus] = useState("");
  const [problemType, setProblemType] = useState("");
  const [bulkRunning, setBulkRunning] = useState<"trigger" | "stop" | "resume" | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionReason, setResolutionReason] = useState("customer_resolved");

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

  const handleBulkAction = async (action: "trigger" | "stop" | "resume") => {
    setBulkRunning(action);
    try {
      await Promise.all(
        cases.map((c) => {
          if (action === "trigger") return triggerRecovery(c._id, { workflowType: "default" });
          if (action === "stop") return stopRecovery(c._id);
          return resumeRecovery(c._id);
        })
      );
    } finally {
      setBulkRunning(null);
      await loadCases();
    }
  };

  const handleResolve = async (caseId: string) => {
    await resolveIssue(caseId, { resolutionReason });
    setResolvingId(null);
    await loadCases();
  };

  const busy = bulkRunning !== null || actionLoading;
  const hasInProgress = cases.some((c) => c.status === "in_progress");
  const hasStopped = cases.some((c) => c.status === "stopped");

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>
        <h1 className="text-2xl font-semibold text-white">Recovery cases</h1>
        <p className="mt-2 text-sm text-[#777]">
          Active and past recovery attempts handled by Revo.
        </p>
      </div>

      {/* Bulk action panel */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#292929] bg-[#151515] p-5">
        <div>
          <p className="text-sm text-white">Bulk actions</p>
          <p className="mt-1 text-xs text-[#666]">
            Applies to all {cases.length} customer{cases.length === 1 ? "" : "s"} currently shown below.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            disabled={busy || cases.length === 0}
            onClick={() => handleBulkAction("trigger")}
            className="cursor-pointer rounded-lg bg-white px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {bulkRunning === "trigger" ? "Triggering…" : "Trigger all"}
          </button>

          {hasInProgress && (
            <button
              disabled={busy}
              onClick={() => handleBulkAction("stop")}
              className="cursor-pointer rounded-lg border border-red-400/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              {bulkRunning === "stop" ? "Stopping…" : "Stop all"}
            </button>
          )}

          {hasStopped && (
            <button
              disabled={busy}
              onClick={() => handleBulkAction("resume")}
              className="cursor-pointer rounded-lg border border-green-400/40 px-4 py-2 text-xs font-medium text-green-400 hover:bg-green-500/10 disabled:opacity-50"
            >
              {bulkRunning === "resume" ? "Resuming…" : "Resume all"}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#292929] bg-[#151515] px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="stopped">Stopped</option>
          <option value="resolved">Resolved</option>
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
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    Loading recovery cases…
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

              {!loading && !error && cases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    No recovery cases found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                cases.map((c) => {
                  const reasonMeta = c.problemType ? FAILURE_REASON_META[c.problemType] : null;
                  const isIssueCustomer = c.customer?.status === "issue";
                  const canResolve = c.status !== "resolved" && c.status !== "stopped";
                  const isResolving = resolvingId === c._id;

                  return (
                    <tr key={c._id} className="border-b border-[#292929] last:border-0">
                      <td className="px-5 py-3 text-white">
                        <div>{c.customer?.fullName ?? "—"}</div>
                        <div className="text-xs text-[#666]">{c.customer?.email}</div>
                      </td>
                      <td className="px-5 py-3 text-[#aaa]">
                        {c.payment?.amount !== undefined
                          ? `${c.payment.currency} ${c.payment.amount}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-[#aaa] capitalize">
                        {c.status.replace("_", " ")}
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
                        <div className="flex items-center justify-end gap-3">
                          {isIssueCustomer && canResolve && (
                            <>
                              {isResolving ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={resolutionReason}
                                    onChange={(e) => setResolutionReason(e.target.value)}
                                    className="rounded-lg border border-[#292929] bg-[#0d0d0d] px-2 py-1 text-xs text-white focus:outline-none"
                                  >
                                    {RESOLUTION_REASONS.map((r) => (
                                      <option key={r.value} value={r.value}>
                                        {r.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleResolve(c._id)}
                                    className="cursor-pointer text-xs text-green-500 hover:text-green-400 disabled:opacity-50"
                                  >
                                    {actionLoading ? "Saving…" : "Confirm"}
                                  </button>
                                  <button
                                    onClick={() => setResolvingId(null)}
                                    className="cursor-pointer text-xs text-[#666] hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setResolvingId(c._id);
                                    setResolutionReason("customer_resolved");
                                  }}
                                  className="cursor-pointer text-xs text-green-500 hover:text-green-400"
                                >
                                  Resolve
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => navigate(`/recovery/${c._id}`)}
                            className="cursor-pointer text-xs text-[#888] hover:text-white"
                          >
                            Open →
                          </button>
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