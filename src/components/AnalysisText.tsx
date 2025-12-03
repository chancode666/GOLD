"use client";

import { AnalysisResult } from "@/lib/analysis";

interface AnalysisTextProps {
  analysis: AnalysisResult;
}

export default function AnalysisText({ analysis }: AnalysisTextProps) {
  const statusStyles = {
    safe: "border-green-500/30 bg-green-900/20",
    warning: "border-yellow-500/30 bg-yellow-900/20",
    danger: "border-red-500/30 bg-red-900/20",
  };

  const statusIcons = {
    safe: "O",
    warning: "!",
    danger: "X",
  };

  const statusLabels = {
    safe: "방어 중",
    warning: "주의 필요",
    danger: "위험 신호",
  };

  return (
    <div className={`card ${statusStyles[analysis.status]}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
            analysis.status === "safe"
              ? "bg-green-500/20 text-green-400"
              : analysis.status === "warning"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-red-500/20 text-red-400"
          }`}
        >
          {statusIcons[analysis.status]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">상황 분석</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                analysis.status === "safe"
                  ? "bg-green-500/20 text-green-400"
                  : analysis.status === "warning"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {statusLabels[analysis.status]}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {analysis.interpretation}
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <span className="text-slate-500">Gold USD: </span>
              <span
                className={
                  analysis.goldChange >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {analysis.goldChange >= 0 ? "+" : ""}
                {analysis.goldChange.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500">USD/KRW: </span>
              <span
                className={
                  analysis.fxChange >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {analysis.fxChange >= 0 ? "+" : ""}
                {analysis.fxChange.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500">KRW/g: </span>
              <span
                className={
                  analysis.krwGoldChange >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {analysis.krwGoldChange >= 0 ? "+" : ""}
                {analysis.krwGoldChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
