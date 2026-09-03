type RecoveryStatus = "Recovered" | "Escalated" | "Retrying";

type RecoveryRowProps = {
  customer: string;
  amount: string;
  status: RecoveryStatus;
  attempts: number;
  reason: string;
};

export default function RecoveryRow({
  customer,
  amount,
  status,
  attempts,
  reason,
}: RecoveryRowProps) {
  const statusStyles: Record<RecoveryStatus, string> = {
    Recovered: "bg-green-500/10 text-green-500",
    Escalated: "bg-red-500/10 text-red-400",
    Retrying: "bg-blue-500/10 text-blue-400",
  };

  return (
    <tr className="border-b border-[#292929] last:border-0">
      <td className="px-5 py-3 font-medium text-[#ddd]">
        {customer}
      </td>

      <td className="px-5 py-3 text-[#ddd]">
        {amount}
      </td>

      <td className="px-5 py-3">
        <span
          className={`rounded-md px-2 py-1 text-[11px] font-medium ${statusStyles[status]}`}
        >
          {status}
        </span>
      </td>

      <td className="px-5 py-3 text-[#bbb]">
        {attempts}
      </td>

      <td className="px-5 py-3 font-mono text-xs text-[#777]">
        {reason}
      </td>
    </tr>
  );
}