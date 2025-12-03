"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HistoryData } from "@/types/market";
import { TIME_RANGES } from "@/lib/constants";

interface GoldKRWChartProps {
  data: HistoryData[];
  selectedRange: number;
  onRangeChange: (days: number) => void;
}

export default function GoldKRWChart({
  data,
  selectedRange,
  onRangeChange,
}: GoldKRWChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatPrice = (value: number) => {
    return `${(value / 1000).toFixed(0)}k`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-amber-400 font-bold">
            {Math.round(payload[0].value).toLocaleString()}원/g
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          원화 기준 금 가격 (KRW/g)
        </h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => onRangeChange(range.days)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedRange === range.days
                  ? "bg-amber-500 text-black font-medium"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatPrice}
              stroke="#64748b"
              fontSize={12}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="goldKRW"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#fbbf24" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
