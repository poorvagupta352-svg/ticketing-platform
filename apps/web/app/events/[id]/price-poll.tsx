"use client";

import { useEffect, useState } from "react";

import { formatMoney, type PriceBreakdown } from "../../../lib/api";

type Props = {
  eventId: number;
  initialBreakdown: PriceBreakdown;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:3001";

export default function PricePoll({ eventId, initialBreakdown }: Props) {
  const [breakdown, setBreakdown] = useState<PriceBreakdown>(initialBreakdown);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`${apiBaseUrl}/events/${eventId}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { breakdown: PriceBreakdown };
      setBreakdown(data.breakdown);
    }, 30_000);

    return () => clearInterval(interval);
  }, [eventId]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-lg font-medium">Price Breakdown</h3>
      <p className="mt-2 text-sm text-slate-300">
        Current price: <span className="font-semibold">{formatMoney(breakdown.finalPrice)}</span>
      </p>
      <ul className="mt-3 space-y-1 text-sm text-slate-400">
        <li>Time adjustment: {(breakdown.timeAdjustment * 100).toFixed(0)}%</li>
        <li>Demand adjustment: {(breakdown.demandAdjustment * 100).toFixed(0)}%</li>
        <li>Inventory adjustment: {(breakdown.inventoryAdjustment * 100).toFixed(0)}%</li>
        <li>Weighted total: {(breakdown.weightedAdjustment * 100).toFixed(0)}%</li>
      </ul>
    </div>
  );
}
