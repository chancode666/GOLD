export interface MarketSnapshot {
  goldUSD: number;
  usdKRW: number;
  goldKRW: number;
  goldChange24h: number;
  fxChange24h: number;
  goldKRWChange24h: number;
  timestamp: string;
}

export interface HistoryData {
  date: string;
  goldUSD: number;
  usdKRW: number;
  goldKRW: number;
}

export interface Holdings {
  amount: number;
  avgPrice: number;
}

export interface HoldingsAnalysis {
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}
