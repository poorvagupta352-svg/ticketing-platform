import { describe, expect, it } from "vitest";

import { calculatePrice } from "./pricing";

const baseInput = {
  basePrice: 1000,
  floorPrice: 700,
  ceilingPrice: 1600,
  totalTickets: 100,
  bookedTickets: 20,
  bookingsLastHour: 0,
  weights: {
    time: 1,
    demand: 1,
    inventory: 1,
  },
};

describe("calculatePrice", () => {
  it("applies time rule for near events", () => {
    const result = calculatePrice({
      ...baseInput,
      eventDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });

    expect(result.timeAdjustment).toBe(0.5);
    expect(result.finalPrice).toBe(1500);
  });

  it("applies demand rule independently", () => {
    const result = calculatePrice({
      ...baseInput,
      eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      bookingsLastHour: 15,
    });

    expect(result.demandAdjustment).toBe(0.15);
    expect(result.finalPrice).toBe(1150);
  });

  it("applies inventory rule when less than 20 percent remain", () => {
    const result = calculatePrice({
      ...baseInput,
      eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      bookedTickets: 81,
    });

    expect(result.inventoryAdjustment).toBe(0.25);
    expect(result.finalPrice).toBe(1250);
  });

  it("combines weighted rules deterministically", () => {
    const result = calculatePrice({
      ...baseInput,
      eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      bookingsLastHour: 20,
      bookedTickets: 90,
      weights: {
        time: 0.5,
        demand: 1,
        inventory: 0.8,
      },
    });

    expect(result.weightedAdjustment).toBeCloseTo(0.45, 6);
    expect(result.finalPrice).toBe(1450);
  });

  it("respects price floor", () => {
    const result = calculatePrice({
      ...baseInput,
      basePrice: 500,
      floorPrice: 700,
      ceilingPrice: 1600,
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    expect(result.finalPrice).toBe(700);
  });

  it("respects price ceiling", () => {
    const result = calculatePrice({
      ...baseInput,
      basePrice: 1400,
      floorPrice: 700,
      ceilingPrice: 1500,
      eventDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      bookingsLastHour: 25,
      bookedTickets: 95,
    });

    expect(result.finalPrice).toBe(1500);
  });
});
