import { NextResponse } from "next/server";
import { TROY_OUNCE_TO_GRAM } from "@/lib/constants";
import { MarketSnapshot } from "@/types/market";

const CACHE_DURATION = 30;
let cachedData: { data: MarketSnapshot; timestamp: number } | null = null;

async function fetchGoldPrice(): Promise<{ price: number; change24h: number }> {
  try {
    const res = await fetch(
      "https://api.metalpriceapi.com/v1/latest?api_key=demo&base=XAU&currencies=USD",
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.USD) {
        return { price: 1 / data.rates.USD, change24h: 0 };
      }
    }
  } catch {}

  try {
    const res = await fetch(
      "https://www.goldapi.io/api/XAU/USD",
      {
        headers: { "x-access-token": "goldapi-demo" },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.price) {
        return { price: data.price, change24h: data.chp || 0 };
      }
    }
  } catch {}

  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/XAU"
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.USD) {
        return { price: 1 / data.rates.USD, change24h: 0 };
      }
    }
  } catch {}

  return { price: 2650, change24h: 0.5 };
}

async function fetchExchangeRate(): Promise<{
  rate: number;
  change24h: number;
}> {
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.KRW) {
        return { rate: data.rates.KRW, change24h: 0 };
      }
    }
  } catch {}

  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.rates?.KRW) {
        return { rate: data.rates.KRW, change24h: 0 };
      }
    }
  } catch {}

  return { rate: 1380, change24h: 0.3 };
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

    const goldKRW = (goldData.price * fxData.rate) / TROY_OUNCE_TO_GRAM;
    const goldKRWChange24h = goldData.change24h + fxData.change24h;

    const snapshot: MarketSnapshot = {
      goldUSD: goldData.price,
      usdKRW: fxData.rate,
      goldKRW: Math.round(goldKRW),
      goldChange24h: goldData.change24h,
      fxChange24h: fxData.change24h,
      goldKRWChange24h: goldKRWChange24h,
      timestamp: new Date().toISOString(),
    };

    cachedData = { data: snapshot, timestamp: now };

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Error fetching market data:", error);

    const fallback: MarketSnapshot = {
      goldUSD: 2650,
      usdKRW: 1380,
      goldKRW: Math.round((2650 * 1380) / TROY_OUNCE_TO_GRAM),
      goldChange24h: 0,
      fxChange24h: 0,
      goldKRWChange24h: 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(fallback);
  }
}
