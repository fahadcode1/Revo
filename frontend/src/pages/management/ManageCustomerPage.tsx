import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCustomer } from "../../hooks/useCreateCustomer";

type CustomerType = "standard" | "with-issue" | "without-issue";

export default function ManageCustomerPage() {
  const navigate = useNavigate();
  const { createStandard, createWithIssue, createWithoutIssue, loading, error } =
    useCreateCustomer();

  const [type, setType] = useState<CustomerType>("standard");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [issueType, setIssueType] = useState("payment_failed");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    setIssueType("payment_failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const base = { fullName, email, phone };
    let result = null;

    if (type === "standard") {
      result = await createStandard({ ...base, status });
    } else if (type === "with-issue") {
      result = await createWithIssue({ ...base, issueType });
    } else {
      result = await createWithoutIssue(base);
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

        {/* Conditional field */}
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

        {type === "with-issue" && (
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