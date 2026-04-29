type PricingInput = {
  basePrice: number;
  floorPrice: number;
  ceilingPrice: number;
  eventDate: Date;
  totalTickets: number;
  bookedTickets: number;
  bookingsLastHour: number;
  weights: {
    time: number;
    demand: number;
    inventory: number;
  };
};

export type PricingBreakdown = {
  timeAdjustment: number;
  demandAdjustment: number;
  inventoryAdjustment: number;
  weightedAdjustment: number;
  finalPrice: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getTimeAdjustment(eventDate: Date): number {
  const now = new Date();
  const msDiff = eventDate.getTime() - now.getTime();
  const daysLeft = msDiff / (24 * 60 * 60 * 1000);

  if (daysLeft <= 1) return 0.5;
  if (daysLeft <= 7) return 0.2;
  return 0;
}

function getDemandAdjustment(bookingsLastHour: number): number {
  return bookingsLastHour > 10 ? 0.15 : 0;
}

function getInventoryAdjustment(totalTickets: number, bookedTickets: number): number {
  const remaining = totalTickets - bookedTickets;
  const remainingRatio = remaining / totalTickets;
  return remainingRatio < 0.2 ? 0.25 : 0;
}

export function calculatePrice(input: PricingInput): PricingBreakdown {
  const timeAdjustment = getTimeAdjustment(input.eventDate);
  const demandAdjustment = getDemandAdjustment(input.bookingsLastHour);
  const inventoryAdjustment = getInventoryAdjustment(input.totalTickets, input.bookedTickets);

  const weightedAdjustment =
    timeAdjustment * input.weights.time +
    demandAdjustment * input.weights.demand +
    inventoryAdjustment * input.weights.inventory;

  const rawPrice = input.basePrice * (1 + weightedAdjustment);
  const finalPrice = clamp(rawPrice, input.floorPrice, input.ceilingPrice);

  return {
    timeAdjustment,
    demandAdjustment,
    inventoryAdjustment,
    weightedAdjustment,
    finalPrice: Number(finalPrice.toFixed(2)),
  };
}
