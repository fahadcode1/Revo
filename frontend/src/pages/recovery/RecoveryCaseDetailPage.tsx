import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useRecoveryCases } from "../../hooks/useRecoveryCases";
import { useConversation } from "../../hooks/useConversation";
import { useRecoveryActions } from "../../hooks/useRecoveryActions";
import type { RecoveryCase } from "../../components/types/recovery";
import type { Message, FollowUpAction } from "../../components/types/conversation";

const INTENT_LABELS: Record<string, string> = {
  promise_to_pay: "Promise to pay",
  dispute: "Dispute",
  request_help: "Requested help",
  refusal: "Refusal",
};

const RESOLUTION_REASONS = [
  { value: "card_updated", label: "Card updated" },
  { value: "balance_added", label: "Balance added" },
  { value: "payment_method_changed", label: "Payment method changed" },
  { value: "customer_resolved", label: "Customer resolved" },
  { value: "other", label: "Other" },
];

export default function RecoveryCaseDetailPage() {
  const { recoveryCaseId } = useParams<{ recoveryCaseId: string }>();
  const { getCaseById } = useRecoveryCases();
  const { getMessages, replyAsCustomer, loading: sending, error } = useConversation();
  const { resolveIssue, loading: resolving } = useRecoveryActions();

  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [lastIntentByMessageId, setLastIntentByMessageId] = useState<Record<string, string>>({});
  const [flashNotice, setFlashNotice] = useState<string | null>(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionReason, setResolutionReason] = useState("customer_resolved");
  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadAll = useCallback(async () => {
    if (!recoveryCaseId) return;
    const [caseResult, messagesResult] = await Promise.all([
      getCaseById(recoveryCaseId),
      getMessages(recoveryCaseId),
    ]);
    if (caseResult) setRecoveryCase(caseResult);
    if (messagesResult) setMessages(messagesResult);
  }, [recoveryCaseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isStopped = recoveryCase?.status === "stopped";

  const handleSend = async () => {
    if (!recoveryCaseId || !recoveryCase || !reply.trim()) return;

    const result = await replyAsCustomer(recoveryCaseId, {
      customerId: recoveryCase.customer._id,
      content: reply.trim(),
      channel: "in_app",
    });

    if (!result) return;

    setReply("");

    // Refresh full state so status changes (stopped/escalated) and new messages both reflect
    await loadAll();

    if (result.message?._id) {
      setLastIntentByMessageId((prev) => ({
        ...prev,
        [result.message._id]: result.intent?.intent ?? "",
      }));
    }

    const action: FollowUpAction | undefined = result.followUp?.action;
    if (action === "escalated") {
      setFlashNotice("Escalated to human");
    } else if (action === "stopped") {
      setFlashNotice("Recovery stopped");
    } else if (action === "retry_scheduled") {
      setFlashNotice("Payment retry scheduled");
    } else {
      setFlashNotice(null);
    }
  };

  const handleResolve = async () => {
    if (!recoveryCaseId) return;
    const result = await resolveIssue(recoveryCaseId, { resolutionReason });
    if (result) {
      setShowResolveForm(false);
      await loadAll();
    }
  };

  if (!recoveryCase) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8 text-white">
        <p className="text-[#666]">Loading recovery case…</p>
      </main>
    );
  }

  const escalated = recoveryCase.status === "in_progress" && flashNotice === "Escalated to human";
  const canResolve =
    recoveryCase.customer?.status === "issue" &&
    recoveryCase.status !== "resolved" &&
    recoveryCase.status !== "stopped";

  return (
    <main className="mx-auto max-w-4xl px-6 py-8 text-white">
      {/* Case header */}
      <div className="mb-6 rounded-xl border border-[#292929] bg-[#151515] p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">
              {recoveryCase.customer.fullName}
            </h1>
            <p className="mt-1 text-xs text-[#666]">{recoveryCase.customer.email}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#202020] px-2 py-1 text-[11px] capitalize text-[#ccc]">
                {recoveryCase.status.replace("_", " ")}
              </span>
              {(escalated || recoveryCase.status === "stopped") && (
                <span className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-400">
                  {recoveryCase.status === "stopped" ? "Recovery stopped" : "Escalated to human"}
                </span>
              )}
            </div>

            {canResolve && (
              <>
                {showResolveForm ? (
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
                      disabled={resolving}
                      onClick={handleResolve}
                      className="cursor-pointer rounded-lg bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                    >
                      {resolving ? "Saving…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setShowResolveForm(false)}
                      className="cursor-pointer text-xs text-[#666] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowResolveForm(true);
                      setResolutionReason("customer_resolved");
                    }}
                    className="cursor-pointer rounded-lg border border-green-400/40 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/10"
                  >
                    Resolve issue
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-[#666]">Revenue at risk</p>
            <p className="mt-1 text-white">
              {recoveryCase.payment.currency} {recoveryCase.revenueAtRisk}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#666]">Problem type</p>
            <p className="mt-1 capitalize text-white">
              {recoveryCase.problemType.replace("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#666]">Workflow type</p>
            {/* ⚠️ ASSUMPTION: field name — adjust once Workflow.Model.ts confirmed */}
            <p className="mt-1 text-white">
              {recoveryCase.currentWorkflow?.type ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#666]">Workflow status</p>
            <p className="mt-1 text-white">
              {recoveryCase.currentWorkflow?.status ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Conversation thread */}
      <div className="rounded-xl border border-[#292929] bg-[#151515]">
        <div className="border-b border-[#292929] px-5 py-4">
          <h2 className="text-sm font-medium text-white">Conversation</h2>
        </div>

        <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <p className="text-center text-xs text-[#666]">No messages yet.</p>
          )}

          {messages.map((m) => {
            if (m.sender === "SYSTEM") {
              return (
                <div key={m._id} className="flex justify-center">
                  <span className="rounded-md bg-[#1c1c1c] px-3 py-1 text-[11px] text-[#777]">
                    {m.content}
                  </span>
                </div>
              );
            }

            const isAI = m.sender === "AI";
            const intent = lastIntentByMessageId[m._id];

            return (
              <div
                key={m._id}
                className={`flex flex-col ${isAI ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                    isAI
                      ? "bg-blue-500/10 text-blue-100"
                      : "bg-[#242424] text-[#ddd]"
                  }`}
                >
                  {m.content}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-[#555]">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                  {!isAI && intent && (
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-[#999]">
                      Interpreted: {INTENT_LABELS[intent] ?? intent}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={threadEndRef} />
        </div>

        {/* Reply box */}
        <div className="border-t border-[#292929] p-4">
          {isStopped ? (
            <p className="text-center text-xs text-[#666]">
              This case is stopped — replies are disabled.
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Reply as customer…"
                disabled={sending}
                className="flex-1 rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={sending || !reply.trim()}
                className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </main>
  );
}