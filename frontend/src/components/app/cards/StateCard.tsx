type StatCardProps = {
  label: string;
  value: string | number;
  valueClass?: string;
};

export default function StatCard({
  label,
  value,
  valueClass = "text-white",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#292929] bg-[#151515] px-5 py-4">
      <p className="text-xs text-[#777]">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}