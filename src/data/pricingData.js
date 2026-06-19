// ─────────────────────────────────────────────
// MOVESTER MOVING — REAL OPERATIONAL PRICING
// Source: Yauvan's internal document (Jun 2026)
// ─────────────────────────────────────────────

// ── BUSINESS BASE ─────────────────────────────
export const BASE_LOCATION = {
  city: "Kitchener-Waterloo",
  province: "Ontario",
  note: "All KM calculations start from KW. We pick up the truck here."
};

// ── TRUCK COSTS (INTERNAL — NEVER SHOW CLIENT) ─
export const TRUCK_COSTS = {
  uhaul: {
    name: "U-Haul 16ft",
    dailyRate: 40,
    insurance: 19,
    kmRate: 1.19,
    freeKm: 0,
    maxSize: "3BR house",
    preferredFor: "local and medium jobs under 200km",
    fuelCapacity: 300,       // dollars to fill full tank
    fuelRangeKm: 700,        // km on a full tank
  },
  enterprise: {
    name: "Enterprise Cargo Van",
    dailyRate: 120,
    insurance: 37,
    kmRate: 0.20,
    freeKmPerDay: 200,
    maxSize: "3BR apartment",
    preferredFor: "long routes 200–400km per day",
    fuelCapacity: 220,
    fuelRangeKm: 700,
    note: "Preferred on long routes — 200 free KMs saves a lot"
  },
  homedepot: {
    name: "Home Depot Cargo Van (12ft)",
    dailyRate: 140,
    insurance: "own",        // uses their own insurance
    kmRate: 0,
    freeKm: Infinity,        // unlimited KM
    maxSize: "1BR only",
    preferredFor: "local 1BR jobs, student moves",
    note: "Unlimited KM is great but maxes out at 1BR furniture"
  }
};

// ── CLIENT PRICING (WHAT WE CHARGE) ───────────
// These are real rates from Yauvan. Not estimates.
export const CLIENT_PRICING = {
  student: {
    label: "Student Move",
    baseMin: 80,
    baseMax: 200,
    localKWC: {
      smallLoad: 80,         // 4 suitcases + foldable mattress
      withBedFrame: 220,     // needs high-roof cargo van
    },
    workerCount: 1,
    truckType: "homedepot",
    note: "Bed frame needs high-roof cargo van"
  },
  oneBR: {
    label: "1 Bedroom",
    baseMin: 450,
    baseMax: 550,
    localKWC: 450,           // bare minimum in KWC
    workerCount: 2,
    truckType: "uhaul",
    stairSurcharge: 50,
    gtaSurcharge: { min: 50, max: 100 }, // secretly added for GTA gas
  },
  twoBR: {
    label: "2 Bedroom",
    baseMin: 650,
    baseMax: 950,
    workerCount: 3,
    truckType: "uhaul",
    stairSurcharge: 100,
    note: "Higher end if heavy furniture involved"
  },
  threeBR: {
    label: "3 Bedroom",
    baseMin: 950,
    baseMax: 1550,
    workerCount: 4,
    truckType: "uhaul",
    stairSurcharge: 150,
  },
  office: {
    label: "Office / Commercial",
    baseMin: 800,
    baseMax: 1800,
    workerCount: 4,
    truckType: "uhaul",
    note: "Quote individually based on scope"
  }
};

// ── SURCHARGES ────────────────────────────────
export const SURCHARGES = {
  stairs: {
    student: 0,
    oneBR: 50,
    twoBR: 100,
    threeBR: 150,
    note: "Per staircase. Add per location (pickup AND dropoff each count)."
  },
  monthEnd: {
    amount: 75,
    note: "Last 5 days of the month. Every mover charges this."
  },
  gta: {
    min: 50,
    max: 100,
    note: "Added internally for GTA jobs to cover gas. Not shown as a line item."
  },
  tax: {
    rate: 0.13,  // HST Ontario 13%
    note: "Taxes extra on ALL jobs."
  }
};

// ── LONG DISTANCE RULES ───────────────────────
export const LONG_DISTANCE = {
  threshold: 80,             // jobs over 80km one-way = long distance
  truckType: "enterprise",   // ALWAYS cargo van for long distance (unlimited KM)
  kmRate: 1.00,              // $1 per km, BOTH WAYS counted
  flatVanFee: 99,            // flat fee added to every long distance job, no exceptions
  calculation: "roundTrip",  // distance x2 (up and down both counted)
  example: {
    route: "Brampton to Sarnia",
    oneWayKm: 275,
    totalKm: 550,            // 275 x 2
    kmCost: 550,             // 550 x $1
    vanFee: 99,
    estimatedTotal: 650,     // 550 + 99 ≈ 650 (plus base move cost)
  },
  note: "Only cargo vans for long distance — unlimited KM is essential"
};

// ── WORKER COSTS (INTERNAL) ───────────────────
export const WORKER_COSTS = {
  dailyMin: 150,
  dailyMax: 200,
  dailyMidpoint: 175,        // use this for estimates
  note: "Each guy on the job makes minimum $150–200 per day."
};

// ── DISTANCE RULES ────────────────────────────
export const DISTANCE_RULES = {
  startingPoint: "Kitchener-Waterloo, ON",
  checkpoints: [
    "KW depot → client pickup location",
    "client pickup location → client drop location",
  ],
  totalBillable: "all KM from depot to final drop",
  note: "Always check all 3 distances as soon as we get customer locations."
};

// ── GAS COSTS (for internal profit calc) ──────
export const GAS_COSTS = {
  truckFull: 300,            // $300 to fill 16ft Uhaul truck
  vanFull: 220,              // $220 to fill cargo van
  rangeKm: 700,              // both get ~700km per tank
  perKmApprox: {
    truck: 0.43,             // 300/700
    van: 0.31,               // 220/700
  }
};

// ── QUOTE DISPLAY RULES ───────────────────────
export const QUOTE_DISPLAY = {
  showToClient: [
    "base price range",
    "stair surcharge (if applicable)",
    "long distance KM cost (if applicable)",
    "HST",
    "total estimate range",
  ],
  neverShowToClient: [
    "truck cost",
    "worker cost",
    "gas cost",
    "GTA surcharge",
    "profit margin",
  ],
  note: "Always show client a RANGE, not a fixed price. Confirm final after job."
};
