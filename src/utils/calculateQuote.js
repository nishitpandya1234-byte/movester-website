// ─────────────────────────────────────────────
// QUOTE CALCULATION ENGINE
// All logic from Yauvan's real pricing rules
// ─────────────────────────────────────────────

import {
  CLIENT_PRICING, SURCHARGES, LONG_DISTANCE,
  TRUCK_COSTS, WORKER_COSTS, GAS_COSTS
} from '../data/pricingData';

export function isMonthEnd(date) {
  const d = new Date(date);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return d.getDate() >= lastDay - 4; // last 5 days = month end
}

export function isGTA(city) {
  if (!city) return false;
  const gtaCities = [
    'toronto', 'mississauga', 'brampton', 'markham', 'vaughan',
    'richmond hill', 'oakville', 'burlington', 'etobicoke',
    'scarborough', 'north york', 'ajax', 'pickering', 'oshawa',
    'whitby', 'milton', 'newmarket', 'aurora', 'king city'
  ];
  return gtaCities.some(c => city.toLowerCase().includes(c));
}

export function selectTruck(moveType, distanceKm) {
  if (distanceKm > 80) return 'enterprise';      // long distance = always Enterprise
  if (moveType === 'student') return 'homedepot'; // student local = Home Depot van
  if (moveType === 'oneBR' && distanceKm < 40) return 'homedepot';
  return 'uhaul';                                  // everything else = Uhaul
}

export function calculateTruckCost(truckKey, distanceKm) {
  const truck = TRUCK_COSTS[truckKey];
  let cost = truck.dailyRate + (typeof truck.insurance === 'number' ? truck.insurance : 0);

  if (truckKey === 'uhaul') {
    cost += distanceKm * truck.kmRate;
  } else if (truckKey === 'enterprise') {
    const billableKm = Math.max(0, distanceKm - truck.freeKmPerDay);
    cost += billableKm * truck.kmRate;
  } else if (truckKey === 'homedepot') {
    // unlimited KM — just daily + own insurance (approximate $30 own insurance)
    cost += 30;
  }
  return Math.round(cost);
}

export function calculateGas(truckKey, distanceKm) {
  const perKm = truckKey === 'uhaul'
    ? GAS_COSTS.perKmApprox.truck
    : GAS_COSTS.perKmApprox.van;
  return Math.round(distanceKm * perKm);
}

export function calculateQuote({
  moveType,       // 'student' | 'oneBR' | 'twoBR' | 'threeBR' | 'office'
  distanceKm,     // total KM including from KW depot
  stairsPickup,   // boolean
  stairsDropoff,  // boolean
  moveDate,       // Date object or ISO string
  toCity,         // destination city string
  fromCity,       // origin city string
  workerRate = WORKER_COSTS.dailyMidpoint,
  suppliesCost = 0,
  clientCharge = null,  // if set, used for profit calc
}) {
  const pricing = CLIENT_PRICING[moveType];
  if (!pricing) throw new Error(`Unknown move type: ${moveType}`);

  const km = Number(distanceKm) || 0;
  const isLongDistance = km > 80;
  const gtaJob = isGTA(toCity) || isGTA(fromCity);
  const monthEnd = moveDate ? isMonthEnd(moveDate) : false;
  const truckKey = selectTruck(moveType, km);

  // ── CLIENT-FACING QUOTE ──
  let baseMin = pricing.baseMin;
  let baseMax = pricing.baseMax;
  const lineItems = [];

  lineItems.push({
    label: `${pricing.label} — base rate`,
    min: baseMin,
    max: baseMax,
    internal: false
  });

  // Stair surcharges
  const stairCharge = SURCHARGES.stairs[moveType] || 0;
  let totalStairs = 0;
  if (stairsPickup) totalStairs += stairCharge;
  if (stairsDropoff) totalStairs += stairCharge;
  if (totalStairs > 0) {
    lineItems.push({
      label: 'Stair surcharge',
      min: totalStairs,
      max: totalStairs,
      internal: false
    });
  }

  // Long distance
  let distanceCharge = 0;
  let vanFee = 0;
  if (isLongDistance) {
    const roundTripKm = km * 2;
    distanceCharge = Math.round(roundTripKm * LONG_DISTANCE.kmRate);
    vanFee = LONG_DISTANCE.flatVanFee;
    lineItems.push({
      label: `Long distance (${roundTripKm}km × $1.00/km)`,
      min: distanceCharge,
      max: distanceCharge,
      internal: false
    });
    lineItems.push({
      label: 'Van fee (long distance flat)',
      min: vanFee,
      max: vanFee,
      internal: false
    });
  }

  // Month-end surcharge
  let monthEndCharge = 0;
  if (monthEnd) {
    monthEndCharge = SURCHARGES.monthEnd.amount;
    lineItems.push({
      label: 'Peak period surcharge',
      min: monthEndCharge,
      max: monthEndCharge,
      internal: false
    });
  }

  // GTA gas buffer — INTERNAL ONLY (added to client charge but not disclosed)
  let gtaBuffer = 0;
  if (gtaJob) {
    gtaBuffer = Math.round((SURCHARGES.gta.min + SURCHARGES.gta.max) / 2);
  }

  // Subtotals before tax
  const subtotalMin = baseMin + totalStairs + distanceCharge + vanFee + monthEndCharge + gtaBuffer;
  const subtotalMax = baseMax + totalStairs + distanceCharge + vanFee + monthEndCharge + gtaBuffer;

  // HST (13% Ontario)
  const hstMin = Math.round(subtotalMin * SURCHARGES.tax.rate);
  const hstMax = Math.round(subtotalMax * SURCHARGES.tax.rate);
  lineItems.push({
    label: 'HST (13%)',
    min: hstMin,
    max: hstMax,
    internal: false
  });

  const totalMin = subtotalMin + hstMin;
  const totalMax = subtotalMax + hstMax;

  // ── INTERNAL COST BREAKDOWN ──
  const truckCost = calculateTruckCost(truckKey, km);
  const gasCost = calculateGas(truckKey, km);
  const workerCost = pricing.workerCount * workerRate;
  const totalCost = truckCost + gasCost + workerCost + suppliesCost;

  // Profit (use midpoint of client range if no explicit charge set)
  const revenue = clientCharge ?? Math.round((totalMin + totalMax) / 2);
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  return {
    // Client-visible
    quote: {
      lineItems,
      subtotalMin,
      subtotalMax,
      totalMin,
      totalMax,
      isLongDistance,
      truckType: TRUCK_COSTS[truckKey].name,
      workerCount: pricing.workerCount,
    },
    // Internal only
    internal: {
      truckKey,
      truckCost,
      truckInsurance: TRUCK_COSTS[truckKey].insurance,
      gasCost,
      workerCount: pricing.workerCount,
      workerRate,
      workerCost,
      suppliesCost,
      totalCost,
      revenue,
      profit,
      margin,
      gtaBuffer,
      flags: {
        isGTA: gtaJob,
        isMonthEnd: monthEnd,
        isLongDistance,
        belowThreshold: margin < 25,
        greatMargin: margin >= 40,
      }
    }
  };
}
