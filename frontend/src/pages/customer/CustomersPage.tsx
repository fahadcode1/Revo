import { useState } from "react";
import { useCustomers } from "../../hooks/useCustomers";
import { useDeleteCustomer } from "../../hooks/useDeleteCustomer";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { customers, loading, error, refetch } = useCustomers({ status, search });
  const { deleteCustomer, loading: deleting } = useDeleteCustomer();

  const handleDelete = async (customerId: string) => {
    const ok = await deleteCustomer(customerId);
    if (ok) refetch();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm text-[#666]">Revenue Recovery</p>
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <p className="mt-2 text-sm text-[#777]">
          Everyone currently tracked by Revo.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="flex-1 rounded-lg border border-[#292929] bg-[#151515] px-4 py-2 text-sm text-white placeholder:text-[#666] focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[#292929] bg-[#151515] px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="issue">Has issue</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#292929] bg-[#151515]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#292929] text-xs text-[#666]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    Loading customers…
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

              {!loading && !error && customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#666]">
                    No customers found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                customers.map((c) => (
                  <tr key={c._id} className="border-b border-[#292929] last:border-0">
                    <td className="px-5 py-3 text-white">{c.fullName}</td>
                    <td className="px-5 py-3 text-[#aaa]">{c.email}</td>
                    <td className="px-5 py-3 text-[#aaa]">{c.phone}</td>
                    <td className="px-5 py-3 text-[#aaa]">{c.status}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        disabled={deleting}
                        className="cursor-pointer text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}