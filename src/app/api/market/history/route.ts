import { NextRequest, NextResponse } from "next/server";
import { TROY_OUNCE_TO_GRAM } from "@/lib/constants";
import { HistoryData } from "@/types/market";

function generateHistoricalData(days: number): HistoryData[] {
  const data: HistoryData[] = [];
  const now = new Date();

  const baseGoldUSD = 2650;
  const baseUsdKRW = 1380;

  const goldTrend = 0.0002;
  const fxTrend = 0.0001;
  const goldVolatility = 0.008;
  const fxVolatility = 0.003;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayIndex = days - i;

    const goldNoise =
      (Math.sin(dayIndex * 0.3) * 0.5 +
        Math.sin(dayIndex * 0.7) * 0.3 +
        (Math.random() - 0.5) * 0.4) *
      goldVolatility;
    const fxNoise =
      (Math.sin(dayIndex * 0.2 + 1) * 0.5 +
        Math.sin(dayIndex * 0.5) * 0.3 +
        (Math.random() - 0.5) * 0.4) *
      fxVolatility;

    const goldMultiplier = 1 + goldTrend * dayIndex + goldNoise;
    const fxMultiplier = 1 + fxTrend * dayIndex + fxNoise;

    const goldUSD = baseGoldUSD * goldMultiplier;
    const usdKRW = baseUsdKRW * fxMultiplier;
    const goldKRW = (goldUSD * usdKRW) / TROY_OUNCE_TO_GRAM;

    data.push({
      date: date.toISOString().split("T")[0],
      goldUSD: Math.round(goldUSD * 100) / 100,
      usdKRW: Math.round(usdKRW * 100) / 100,
      goldKRW: Math.round(goldKRW),
    });
  }

  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30", 10);

  const validDays = Math.min(Math.max(days, 1), 365);

  const history = generateHistoricalData(validDays);

  return NextResponse.json(history);
}
