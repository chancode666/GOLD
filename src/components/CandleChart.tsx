"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, CandlestickSeries } from "lightweight-charts";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

type Timeframe = "1H" | "1D" | "1M";

const TIMEFRAME_OPTIONS: { label: string; value: Timeframe }[] = [
  { label: "1시간봉", value: "1H" },
  { label: "일봉", value: "1D" },
  { label: "월봉", value: "1M" },
];

export default function CandleChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#1e293b" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#334155" },
        horzLines: { color: "#334155" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: timeframe === "1H",
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const fetchCandles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/market/candles?timeframe=${timeframe}`);
        if (res.ok) {
          const data: CandleData[] = await res.json();
          candleSeries.setData(data as any);
          chart.timeScale().fitContent();
        }
      } catch (error) {
        console.error("Failed to fetch candles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [timeframe]);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            원화 금 가격 캔들차트 (KRW/g)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            = (국제금 x 환율) / 31.1035
          </p>
        </div>
        <div className="flex gap-1">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeframe(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                timeframe === opt.value
                  ? "bg-amber-500 text-black font-medium"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-10">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>
    </div>
  );
}
