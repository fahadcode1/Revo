import StatCard from "../../components/app/cards/StateCard";
import RecoveryRow from "../../components/app/cards/RecoveryRow";
export default function HomePage() {
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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total processed"
          value="32"
        />

        <StatCard
          label="Recovered"
          value="19"
          valueClass="text-green-500"
        />

        <StatCard
          label="Escalated"
          value="8"
          valueClass="text-red-400"
        />

        <StatCard
          label="Amount recovered"
          value="Rs 24,860"
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
            className="cursor-pointer text-xs text-[#888] transition-colors hover:text-white"
          >
            View all →
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead>
              <tr className="border-b border-[#292929] text-xs text-[#666]">
                <th className="px-5 py-3 font-medium">
                  Customer
                </th>

                <th className="px-5 py-3 font-medium">
                  Amount
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

                <th className="px-5 py-3 font-medium">
                  Attempts
                </th>

                <th className="px-5 py-3 font-medium">
                  Reason
                </th>
              </tr>
            </thead>

            <tbody>
                <RecoveryRow
                customer="Rahul Sharma"
                amount="Rs 999"
                status="Recovered"
                attempts={2}
                reason="insufficient_funds"
                />

                <RecoveryRow
                customer="Priya Singh"
                amount="Rs 1,499"
                status="Escalated"
                attempts={3}
                reason="card_expired"
                />

                <RecoveryRow
                customer="Amit Kumar"
                amount="Rs 499"
                status="Retrying"
                attempts={1}
                reason="bank_declined"
                />

                <RecoveryRow
                customer="Sneha Patel"
                amount="Rs 2,999"
                status="Recovered"
                attempts={1}
                reason="network_error"
                />

                <RecoveryRow
                customer="Vikram Rao"
                amount="Rs 799"
                status="Escalated"
                attempts={3}
                reason="insufficient_funds"
                />

                <RecoveryRow
                customer="Ananya Iyer"
                amount="Rs 1,199"
                status="Retrying"
                attempts={2}
                reason="bank_declined"
                />
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

        <span className="text-xs text-green-500">
          Active
        </span>

      </div>

    </main>
  );
}