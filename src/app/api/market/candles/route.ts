import { NextRequest, NextResponse } from "next/server";
import { TROY_OUNCE_TO_GRAM } from "@/lib/constants";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

type Timeframe = "1H" | "1D" | "1M";

function generateCandleData(timeframe: Timeframe): CandleData[] {
  const candles: CandleData[] = [];
  const now = new Date();

  const baseGoldUSD = 2650;
  const baseUsdKRW = 1380;
  const baseKRWg = (baseGoldUSD * baseUsdKRW) / TROY_OUNCE_TO_GRAM;

  let count: number;
  let stepMs: number;

  switch (timeframe) {
    case "1H":
      count = 168; // 7 days * 24 hours
      stepMs = 60 * 60 * 1000;
      break;
    case "1D":
      count = 90; // 90 days
      stepMs = 24 * 60 * 60 * 1000;
      break;
    case "1M":
      count = 24; // 24 months
      stepMs = 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      count = 90;
      stepMs = 24 * 60 * 60 * 1000;
  }

  const volatility = timeframe === "1H" ? 0.003 : timeframe === "1D" ? 0.008 : 0.02;
  const trend = 0.0001;

  let prevClose = baseKRWg;

  for (let i = count; i >= 0; i--) {
    const timestamp = now.getTime() - i * stepMs;
    const time = Math.floor(timestamp / 1000);

    const trendFactor = 1 + trend * (count - i);
    const noise = (Math.random() - 0.48) * volatility;

    const open = prevClose;
    const change = open * noise * trendFactor;

    const intraVolatility = volatility * 0.5;
    const highExtra = Math.abs(open * Math.random() * intraVolatility);
    const lowExtra = Math.abs(open * Math.random() * intraVolatility);

    let close = open + change;
    let high = Math.max(open, close) + highExtra;
    let low = Math.min(open, close) - lowExtra;

    close = Math.round(close);
    high = Math.round(high);
    low = Math.round(low);

    candles.push({
      time,
      open: Math.round(open),
      high,
      low,
      close,
    });

    prevClose = close;
  }

  return candles;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeframe = (searchParams.get("timeframe") || "1D") as Timeframe;

  const validTimeframes: Timeframe[] = ["1H", "1D", "1M"];
  const tf = validTimeframes.includes(timeframe) ? timeframe : "1D";

  const candles = generateCandleData(tf);

  return NextResponse.json(candles);
}
