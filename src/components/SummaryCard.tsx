"use client";

interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  highlight?: boolean;
}

export default function SummaryCard({
  title,
  value,
  change,
  subtitle,
  highlight = false,
}: SummaryCardProps) {
  const changeColor =
    change === undefined
      ? ""
      : change >= 0
        ? "text-green-400"
        : "text-red-400";

  const changeSign = change !== undefined && change >= 0 ? "+" : "";

  return (
    <div
      className={`card ${highlight ? "border-amber-500/50 bg-amber-900/20" : ""}`}
    >
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p
        className={`text-2xl font-bold ${highlight ? "text-amber-400" : "text-white"}`}
      >
        {value}
      </p>
      {change !== undefined && (
        <p className={`text-sm mt-1 ${changeColor}`}>
          {changeSign}
          {change.toFixed(2)}% (24h)
        </p>
      )}
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
