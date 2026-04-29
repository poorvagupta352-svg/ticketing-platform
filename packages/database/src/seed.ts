import "dotenv/config";

import { db } from "./index";
import { events } from "./schema";

async function main() {
  await db.delete(events);

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  await db.insert(events).values([
    {
      name: "Tech Summit 2026",
      date: new Date(now.getTime() + 40 * dayMs),
      venue: "Convention Center A",
      description: "A multi-track conference for developers and product teams.",
      totalTickets: 500,
      bookedTickets: 120,
      basePrice: "999.00",
      currentPrice: "999.00",
      floorPrice: "699.00",
      ceilingPrice: "1999.00",
      pricingConfig: {
        timeMultiplier: 1,
        demandMultiplier: 1,
        inventoryMultiplier: 1,
      },
    },
    {
      name: "Startup Pitch Night",
      date: new Date(now.getTime() + 10 * dayMs),
      venue: "Downtown Hall",
      description: "Founders pitch their ideas to investors and the public.",
      totalTickets: 150,
      bookedTickets: 90,
      basePrice: "499.00",
      currentPrice: "549.00",
      floorPrice: "299.00",
      ceilingPrice: "999.00",
      pricingConfig: {
        timeMultiplier: 1.2,
        demandMultiplier: 1,
        inventoryMultiplier: 1.1,
      },
    },
    {
      name: "Local Art Exhibition",
      date: new Date(now.getTime() + 5 * dayMs),
      venue: "City Gallery",
      description: "A showcase of works from talented local artists.",
      totalTickets: 200,
      bookedTickets: 180,
      basePrice: "25.00",
      currentPrice: "35.00",
      floorPrice: "15.00",
      ceilingPrice: "50.00",
      pricingConfig: {
        timeMultiplier: 1.5,
        demandMultiplier: 0.8,
        inventoryMultiplier: 1.5,
      },
    },
    {
      name: "Jazz in the Park",
      date: new Date(now.getTime() + 15 * dayMs),
      venue: "Central Park Amphitheater",
      description: "An evening of smooth jazz under the stars.",
      totalTickets: 1000,
      bookedTickets: 400,
      basePrice: "45.00",
      currentPrice: "45.00",
      floorPrice: "30.00",
      ceilingPrice: "80.00",
      pricingConfig: {
        timeMultiplier: 1,
        demandMultiplier: 1.2,
        inventoryMultiplier: 1,
      },
    },
    {
      name: "Web3 Developer Bootcamp",
      date: new Date(now.getTime() + 60 * dayMs),
      venue: "Tech Hub, Room 404",
      description: "Intensive 2-day bootcamp covering smart contracts and dApps.",
      totalTickets: 50,
      bookedTickets: 10,
      basePrice: "1499.00",
      currentPrice: "1499.00",
      floorPrice: "999.00",
      ceilingPrice: "2499.00",
      pricingConfig: {
        timeMultiplier: 1.5,
        demandMultiplier: 1.5,
        inventoryMultiplier: 2,
      },
    },
    {
      name: "Marathon 2026",
      date: new Date(now.getTime() + 90 * dayMs),
      venue: "City Streets",
      description: "Annual city marathon. Register early to save!",
      totalTickets: 5000,
      bookedTickets: 1200,
      basePrice: "85.00",
      currentPrice: "85.00",
      floorPrice: "60.00",
      ceilingPrice: "150.00",
      pricingConfig: {
        timeMultiplier: 2,
        demandMultiplier: 1,
        inventoryMultiplier: 1,
      },
    },
    {
      name: "Comedy Club Special",
      date: new Date(now.getTime() + 2 * dayMs),
      venue: "The Laugh House",
      description: "Surprise special guest comedian. Highly demanded!",
      totalTickets: 120,
      bookedTickets: 115,
      basePrice: "30.00",
      currentPrice: "55.00",
      floorPrice: "20.00",
      ceilingPrice: "70.00",
      pricingConfig: {
        timeMultiplier: 1.5,
        demandMultiplier: 2,
        inventoryMultiplier: 2,
      },
    },
    {
      name: "Food Truck Festival",
      date: new Date(now.getTime() + 20 * dayMs),
      venue: "Riverfront Park",
      description: "Taste food from over 50 of the best local food trucks.",
      totalTickets: 3000,
      bookedTickets: 800,
      basePrice: "15.00",
      currentPrice: "15.00",
      floorPrice: "10.00",
      ceilingPrice: "25.00",
      pricingConfig: {
        timeMultiplier: 1,
        demandMultiplier: 1,
        inventoryMultiplier: 1.2,
      },
    },
    {
      name: "Broadway Musical",
      date: new Date(now.getTime() + 30 * dayMs),
      venue: "Grand Theater",
      description: "Award-winning musical coming to our city for one week only.",
      totalTickets: 800,
      bookedTickets: 650,
      basePrice: "120.00",
      currentPrice: "145.00",
      floorPrice: "90.00",
      ceilingPrice: "250.00",
      pricingConfig: {
        timeMultiplier: 1.2,
        demandMultiplier: 1.5,
        inventoryMultiplier: 1.8,
      },
    },
    {
      name: "Yoga Retreat",
      date: new Date(now.getTime() + 45 * dayMs),
      venue: "Mountain View Lodge",
      description: "A weekend of mindfulness, yoga, and healthy living.",
      totalTickets: 30,
      bookedTickets: 12,
      basePrice: "450.00",
      currentPrice: "450.00",
      floorPrice: "350.00",
      ceilingPrice: "600.00",
      pricingConfig: {
        timeMultiplier: 1.1,
        demandMultiplier: 1.2,
        inventoryMultiplier: 1.5,
      },
    },
  ]);

  console.log("Seed data inserted");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
