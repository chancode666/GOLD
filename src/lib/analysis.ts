import { HistoryData } from "@/types/market";

export interface AnalysisResult {
  goldChange: number;
  fxChange: number;
  krwGoldChange: number;
  interpretation: string;
  status: "safe" | "warning" | "danger";
}

export function analyzeMarket(
  history: HistoryData[],
  periodLabel: string
): AnalysisResult {
  if (history.length < 2) {
    return {
      goldChange: 0,
      fxChange: 0,
      krwGoldChange: 0,
      interpretation: "데이터가 충분하지 않습니다.",
      status: "warning",
    };
  }

  const first = history[0];
  const last = history[history.length - 1];

  const goldChange = ((last.goldUSD - first.goldUSD) / first.goldUSD) * 100;
  const fxChange = ((last.usdKRW - first.usdKRW) / first.usdKRW) * 100;
  const krwGoldChange = ((last.goldKRW - first.goldKRW) / first.goldKRW) * 100;

  let interpretation = "";
  let status: "safe" | "warning" | "danger" = "safe";

  const goldDir = goldChange >= 0 ? "상승" : "하락";
  const fxDir = fxChange >= 0 ? "상승" : "하락";
  const krwDir = krwGoldChange >= 0 ? "상승" : "하락";

  interpretation = `${periodLabel} 동안 국제 금 가격은 ${Math.abs(goldChange).toFixed(1)}% ${goldDir}했으며, `;
  interpretation += `환율은 ${Math.abs(fxChange).toFixed(1)}% ${fxDir}했습니다. `;

  if (krwGoldChange >= 0) {
    interpretation += `이로 인해 원화 기준 금 가격은 ${Math.abs(krwGoldChange).toFixed(1)}% ${krwDir}하여 `;

    if (goldChange < 0 && fxChange > 0) {
      interpretation += "환율 효과로 자산 방어가 이루어지고 있습니다.";
      status = "safe";
    } else if (goldChange > 0 && fxChange > 0) {
      interpretation += "금과 환율 모두 상승하는 강한 방어 국면입니다.";
      status = "safe";
    } else {
      interpretation += "원화 자산 대비 방어 효과가 나타나고 있습니다.";
      status = "safe";
    }
  } else {
    interpretation += `이로 인해 원화 기준 금 가격은 ${Math.abs(krwGoldChange).toFixed(1)}% ${krwDir}했습니다. `;

    if (goldChange < 0 && fxChange < 0) {
      interpretation += "금과 환율 모두 약세로 주의가 필요합니다.";
      status = "danger";
    } else {
      interpretation += "단기적 조정 구간으로 보입니다.";
      status = "warning";
    }
  }

  return {
    goldChange,
    fxChange,
    krwGoldChange,
    interpretation,
    status,
  };
}
