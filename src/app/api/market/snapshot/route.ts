import { NextResponse } from "next/server";
import { TROY_OUNCE_TO_GRAM } from "@/lib/constants";
import { MarketSnapshot } from "@/types/market";

const CACHE_DURATION = 60;
let cachedData: { data: MarketSnapshot; timestamp: number } | null = null;

// 국제 금 시세 (USD/oz) - 여러 API 시도
async function fetchGoldPrice(): Promise<{ price: number; change24h: number }> {
  // 1. Open Exchange Rates 방식 (무료)
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/XAU",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.USD) {
        // XAU 기준이므로 1/rate = USD per oz
        const price = 1 / data.rates.USD;
        return { price, change24h: 0 };
      }
    }
  } catch (e) {
    console.log("API 1 failed:", e);
  }

  // 2. Fallback - 현재 시세 기준 (2024.12)
  return { price: 2650, change24h: 0 };
}

// 환율 (USD/KRW)
async function fetchExchangeRate(): Promise<{ rate: number; change24h: number }> {
  // 1. ExchangeRate-API (무료, 안정적)
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.KRW) {
        return { rate: data.rates.KRW, change24h: 0 };
      }
    }
  } catch (e) {
    console.log("FX API 1 failed:", e);
  }

  // 2. Open Exchange Rates (backup)
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.KRW) {
        return { rate: data.rates.KRW, change24h: 0 };
      }
    }
  } catch (e) {
    console.log("FX API 2 failed:", e);
  }

  return { rate: 1430, change24h: 0 };
}

export async function GET() {
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION * 1000) {
    return NextResponse.json(cachedData.data);
  }

  try {
    const [goldData, fxData] = await Promise.all([
      fetchGoldPrice(),
      fetchExchangeRate(),
    ]);

    // 작업지시서 공식: KRW/g = (XAU/USD × USD/KRW) / 31.1035
    const goldKRW = (goldData.price * fxData.rate) / TROY_OUNCE_TO_GRAM;

    const snapshot: MarketSnapshot = {
      goldUSD: Math.round(goldData.price * 100) / 100,
      usdKRW: Math.round(fxData.rate * 100) / 100,
      goldKRW: Math.round(goldKRW),
      goldChange24h: goldData.change24h,
      fxChange24h: fxData.change24h,
      goldKRWChange24h: 0,
      timestamp: new Date().toISOString(),
    };

    cachedData = { data: snapshot, timestamp: now };

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Error fetching market data:", error);

    // Fallback (2024.12 기준 실제 시세)
    const goldUSD = 2650;
    const usdKRW = 1430;
    const goldKRW = (goldUSD * usdKRW) / TROY_OUNCE_TO_GRAM;

    const fallback: MarketSnapshot = {
      goldUSD,
      usdKRW,
      goldKRW: Math.round(goldKRW),
      goldChange24h: 0,
      fxChange24h: 0,
      goldKRWChange24h: 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(fallback);
  }
}
