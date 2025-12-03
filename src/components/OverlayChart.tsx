"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HistoryData } from "@/types/market";

interface OverlayChartProps {
  data: HistoryData[];
}

export default function OverlayChart({ data }: OverlayChartProps) {
  const [showGold, setShowGold] = useState(true);
  const [showFX, setShowFX] = useState(true);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name === "goldUSD"
                ? `Gold: $${entry.value.toFixed(2)}`
                : `USD/KRW: ${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          금 가격 vs 환율 비교
        </h3>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGold}
              onChange={(e) => setShowGold(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm text-amber-400">Gold (USD)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFX}
              onChange={(e) => setShowFX(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-sm text-blue-400">USD/KRW</span>
          </label>
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
            {showGold && (
              <YAxis
                yAxisId="gold"
                orientation="left"
                stroke="#fbbf24"
                fontSize={12}
                tickFormatter={(v) => `$${v}`}
                domain={["auto", "auto"]}
              />
            )}
            {showFX && (
              <YAxis
                yAxisId="fx"
                orientation="right"
                stroke="#3b82f6"
                fontSize={12}
                domain={["auto", "auto"]}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            {showGold && (
              <Line
                yAxisId="gold"
                type="monotone"
                dataKey="goldUSD"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                name="goldUSD"
              />
            )}
            {showFX && (
              <Line
                yAxisId="fx"
                type="monotone"
                dataKey="usdKRW"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="usdKRW"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-500 mt-3 text-center">
        금(좌축, 노란색) / 환율(우축, 파란색) - 두 라인이 함께 상승하면 강한 방어 국면
      </p>
    </div>
  );
}
