"use client";

import { useState, useEffect } from "react";
import { Holdings } from "@/types/market";

interface HoldingsInputProps {
  onHoldingsChange: (holdings: Holdings | null) => void;
}

const STORAGE_KEY = "gold-holdings";

export default function HoldingsInput({ onHoldingsChange }: HoldingsInputProps) {
  const [amount, setAmount] = useState<string>("");
  const [avgPrice, setAvgPrice] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Holdings;
        setAmount(parsed.amount.toString());
        setAvgPrice(parsed.avgPrice.toString());
        onHoldingsChange(parsed);
      } catch {}
    }
  }, [onHoldingsChange]);

  const handleSave = () => {
    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(avgPrice);

    if (!isNaN(amountNum) && !isNaN(priceNum) && amountNum > 0 && priceNum > 0) {
      const holdings: Holdings = {
        amount: amountNum,
        avgPrice: priceNum,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
      onHoldingsChange(holdings);
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAmount("");
    setAvgPrice("");
    onHoldingsChange(null);
    setIsEditing(false);
  };

  if (!isEditing && amount && avgPrice) {
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">내 보유 금</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            수정
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">보유량</p>
            <p className="text-white font-medium">{amount}g</p>
          </div>
          <div>
            <p className="text-slate-400">평균 매입가</p>
            <p className="text-white font-medium">
              {parseInt(avgPrice).toLocaleString()}원/g
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">내 보유 금 설정</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            보유량 (g)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="예: 100"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            평균 매입 단가 (원/g)
          </label>
          <input
            type="number"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            placeholder="예: 95000"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
          >
            저장
          </button>
          {(amount || avgPrice) && (
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
