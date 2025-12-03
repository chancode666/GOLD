"use client";

import { Holdings, HoldingsAnalysis as HoldingsAnalysisType } from "@/types/market";

interface HoldingsAnalysisProps {
  holdings: Holdings;
  currentGoldKRW: number;
}

export default function HoldingsAnalysis({
  holdings,
  currentGoldKRW,
}: HoldingsAnalysisProps) {
  const currentValue = holdings.amount * currentGoldKRW;
  const investedValue = holdings.amount * holdings.avgPrice;
  const profitLoss = currentValue - investedValue;
  const profitLossPercent = ((currentValue - investedValue) / investedValue) * 100;

  const isProfit = profitLoss >= 0;
  const colorClass = isProfit ? "text-green-400" : "text-red-400";
  const bgClass = isProfit ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30";

  return (
    <div className={`card ${bgClass}`}>
      <h3 className="text-lg font-semibold text-white mb-4">자산 현황</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400">투자 원금</span>
          <span className="text-white font-medium">
            {investedValue.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">현재 평가액</span>
          <span className="text-white font-bold text-lg">
            {Math.round(currentValue).toLocaleString()}원
          </span>
        </div>
        <hr className="border-slate-700" />
        <div className="flex justify-between items-center">
          <span className="text-slate-400">평가손익</span>
          <div className="text-right">
            <p className={`font-bold text-lg ${colorClass}`}>
              {isProfit ? "+" : ""}
              {Math.round(profitLoss).toLocaleString()}원
            </p>
            <p className={`text-sm ${colorClass}`}>
              ({isProfit ? "+" : ""}
              {profitLossPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
