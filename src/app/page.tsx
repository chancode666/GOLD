"use client";

import { useState, useEffect, useCallback } from "react";
import SummaryCard from "@/components/SummaryCard";
import HoldingsInput from "@/components/HoldingsInput";
import HoldingsAnalysis from "@/components/HoldingsAnalysis";
import CandleChart from "@/components/CandleChart";
import OverlayChart from "@/components/OverlayChart";
import AnalysisText from "@/components/AnalysisText";
import { MarketSnapshot, HistoryData, Holdings } from "@/types/market";
import { analyzeMarket, AnalysisResult } from "@/lib/analysis";
import { TIME_RANGES, REFRESH_INTERVAL } from "@/lib/constants";

export default function Home() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [holdings, setHoldings] = useState<Holdings | null>(null);
  const [selectedRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [snapshotRes, historyRes] = await Promise.all([
        fetch("/api/market/snapshot"),
        fetch(`/api/market/history?days=${selectedRange}`),
      ]);

      if (snapshotRes.ok) {
        const snapshotData = await snapshotRes.json();
        setSnapshot(snapshotData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getRangeLabel = (days: number): string => {
    const range = TIME_RANGES.find((r) => r.days === days);
    return range ? range.label : `${days}D`;
  };

  const analysis: AnalysisResult | null =
    history.length > 0
      ? analyzeMarket(history, `최근 ${getRangeLabel(selectedRange)}`)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">
            Gold Dashboard
          </h1>
          <p className="text-slate-400">
            원화 자산 방어 상태 계기판
          </p>
          {lastUpdate && (
            <p className="text-xs text-slate-500 mt-1">
              마지막 업데이트:{" "}
              {lastUpdate.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="국제 금 가격"
            value={snapshot ? `$${snapshot.goldUSD.toFixed(2)}` : "-"}
            change={snapshot?.goldChange24h}
            subtitle="XAU/USD (oz)"
          />
          <SummaryCard
            title="원/달러 환율"
            value={snapshot ? `${snapshot.usdKRW.toFixed(2)}` : "-"}
            change={snapshot?.fxChange24h}
            subtitle="USD/KRW"
          />
          <SummaryCard
            title="원화 금 가격"
            value={
              snapshot ? `${snapshot.goldKRW.toLocaleString()}원` : "-"
            }
            change={snapshot?.goldKRWChange24h}
            subtitle="KRW/g"
            highlight
          />
          {holdings && snapshot && (
            <SummaryCard
              title="내 보유 평가액"
              value={`${Math.round(holdings.amount * snapshot.goldKRW).toLocaleString()}원`}
              subtitle={`${holdings.amount}g 보유`}
            />
          )}
        </section>

        {analysis && (
          <section className="mb-8">
            <AnalysisText analysis={analysis} />
          </section>
        )}

        <section className="mb-8">
          <CandleChart />
        </section>

        <section className="mb-8">
          <OverlayChart data={history} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HoldingsInput onHoldingsChange={setHoldings} />
          {holdings && snapshot && (
            <HoldingsAnalysis
              holdings={holdings}
              currentGoldKRW={snapshot.goldKRW}
            />
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-slate-600">
          <p>
            본 대시보드는 개인 자산 방어 상태 확인용이며, 투자 조언이 아닙니다.
          </p>
          <p className="mt-1">
            데이터는 실시간 시세와 차이가 있을 수 있습니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
