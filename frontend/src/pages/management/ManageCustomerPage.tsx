import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCustomer } from "../../hooks/useCreateCustomer";

type CustomerType = "standard" | "with-issue" | "without-issue";

const PROVIDER = "razorpay" as const;

export default function ManageCustomerPage() {
  const navigate = useNavigate();
  const { createStandard, createWithIssue, createWithoutIssue, loading, error } =
    useCreateCustomer();

  const [type, setType] = useState<CustomerType>("standard");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [issueType, setIssueType] = useState("insufficient_funds");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [failureReason, setFailureReason] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    setIssueType("insufficient_funds");
    setAmount("");
    setCurrency("INR");
    setFailureReason("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const base = { fullName, email, phone };
    let result = null;

    if (type === "standard") {
      result = await createStandard({
        ...base,
        status,
        amount: Number(amount),
        currency,
        provider: PROVIDER,
      });
        } else if (type === "with-issue") {
      result = await createWithIssue({
        ...base,
        issueType,
        amount: Number(amount),
        currency,
        provider: PROVIDER,
        failureReason,
      });

      if (result?.recoveryCase?._id) {
        navigate(`/recovery/${result.recoveryCase._id}`);;
        return;
      }
    } else {
          result = await createWithoutIssue({
            ...base,
            amount: Number(amount),
            currency,
            provider: PROVIDER,
          });
        }

    if (result) {
      setSuccessMsg(`Created ${fullName} successfully.`);
      resetForm();
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>
        <h1 className="text-2xl font-semibold text-white">Manage Customers</h1>
        <p className="mt-2 text-sm text-[#777]">
          Create demo customers to test Revo's recovery flow.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#292929] bg-[#151515] p-6"
      >
        {/* Customer type */}
        <div className="mb-5">
          <label className="mb-2 block text-xs text-[#888]">Customer type</label>
          <div className="flex gap-2">
            {(
              [
                { value: "standard", label: "Standard" },
                { value: "with-issue", label: "With issue" },
                { value: "without-issue", label: "Without issue" },
              ] as { value: CustomerType; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  type === opt.value
                    ? "bg-white text-black"
                    : "border border-[#292929] text-[#888] hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Base fields */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-[#888]">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-[#888]">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-[#888]">Phone</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        {/* Amount + currency — shown for all three types now */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-[#888]">Amount</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Subscription amount"
            className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-[#888]">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Provider — fixed, read-only */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-[#888]">Provider</label>
          <input
            disabled
            value="Razorpay"
            className="w-full cursor-not-allowed rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-[#666] focus:outline-none"
          />
        </div>

        {/* Standard-only field */}
        {type === "standard" && (
          <div className="mb-4">
            <label className="mb-1 block text-xs text-[#888]">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="issue">Issue</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}

        {/* With-issue-only fields */}
        {type === "with-issue" && (
          <>
            <div className="mb-4">
              <label className="mb-1 block text-xs text-[#888]">Issue type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="insufficient_funds">Insufficient funds</option>
                <option value="card_expired">Card expired</option>
                <option value="bank_declined">Bank declined</option>
                <option value="network_error">Network error</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs text-[#888]">Failure reason</label>
              <input
                required
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="e.g. Card declined by issuing bank"
                className="w-full rounded-lg border border-[#292929] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </>
        )}

        {error && <p className="mb-4 text-xs text-red-400">{error}</p>}
        {successMsg && <p className="mb-4 text-xs text-green-500">{successMsg}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create customer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="cursor-pointer rounded-lg border border-[#292929] px-4 py-2 text-sm text-[#888] hover:text-white"
          >
            View customers
          </button>
        </div>
      </form>
    </main>
  );
}