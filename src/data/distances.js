// ─────────────────────────────────────────────
// MOVESTER MOVING — CITY DISTANCE LOOKUP
// Approximate one-way driving distances (km) between common Ontario
// locations on Movester's routes. No Maps API needed — when a pair isn't
// in the table, lookupDistance returns null and the UI asks for manual km.
//
// All KM ultimately bill from the Kitchener-Waterloo (KW) depot, so KW
// routes are the most important to have here.
// ─────────────────────────────────────────────

// Keyed by normalized city name. Distances are symmetric (A→B === B→A).
const DISTANCE_TABLE = [
  // ── From the KW depot ──
  { from: 'kitchener-waterloo', to: 'toronto', km: 120 },
  { from: 'kitchener-waterloo', to: 'brampton', km: 95 },
  { from: 'kitchener-waterloo', to: 'mississauga', km: 110 },
  { from: 'kitchener-waterloo', to: 'hamilton', km: 70 },
  { from: 'kitchener-waterloo', to: 'london', km: 110 },
  { from: 'kitchener-waterloo', to: 'guelph', km: 30 },
  { from: 'kitchener-waterloo', to: 'cambridge', km: 25 },
  { from: 'kitchener-waterloo', to: 'milton', km: 75 },
  { from: 'kitchener-waterloo', to: 'oakville', km: 90 },
  { from: 'kitchener-waterloo', to: 'burlington', km: 80 },
  { from: 'kitchener-waterloo', to: 'markham', km: 135 },
  { from: 'kitchener-waterloo', to: 'vaughan', km: 120 },
  { from: 'kitchener-waterloo', to: 'oshawa', km: 180 },
  { from: 'kitchener-waterloo', to: 'barrie', km: 165 },
  { from: 'kitchener-waterloo', to: 'sarnia', km: 200 },
  { from: 'kitchener-waterloo', to: 'windsor', km: 290 },
  { from: 'kitchener-waterloo', to: 'ottawa', km: 530 },
  { from: 'kitchener-waterloo', to: 'kingston', km: 380 },
  { from: 'kitchener-waterloo', to: 'niagara falls', km: 145 },

  // ── Inter-city (GTA + corridor) ──
  { from: 'toronto', to: 'mississauga', km: 30 },
  { from: 'toronto', to: 'brampton', km: 45 },
  { from: 'toronto', to: 'markham', km: 35 },
  { from: 'toronto', to: 'vaughan', km: 30 },
  { from: 'toronto', to: 'hamilton', km: 70 },
  { from: 'toronto', to: 'oshawa', km: 60 },
  { from: 'toronto', to: 'london', km: 195 },
  { from: 'toronto', to: 'ottawa', km: 450 },
  { from: 'mississauga', to: 'brampton', km: 25 },
  { from: 'mississauga', to: 'oakville', km: 20 },
  { from: 'mississauga', to: 'hamilton', km: 50 },
  { from: 'brampton', to: 'sarnia', km: 275 },
  { from: 'brampton', to: 'vaughan', km: 25 },
  { from: 'hamilton', to: 'london', km: 130 },
  { from: 'hamilton', to: 'niagara falls', km: 70 },
  { from: 'guelph', to: 'toronto', km: 100 },
  { from: 'guelph', to: 'hamilton', km: 50 },
];

function normalize(city) {
  if (!city) return '';
  return city
    .toLowerCase()
    .trim()
    // collapse common KW aliases to one key
    .replace(/\b(kitchener|waterloo|kw|kitchener\s*\/\s*waterloo)\b/g, 'kitchener-waterloo')
    .replace(/\s+/g, ' ');
}

/**
 * Look up the approximate one-way driving distance (km) between two cities.
 * Matching is case-insensitive and order-independent, and uses substring
 * matching so "Toronto, ON" or "123 King St, Toronto" still resolves.
 *
 * @returns {number|null} km, or null if the pair isn't in the table.
 */
export function lookupDistance(fromCity, toCity) {
  const from = normalize(fromCity);
  const to = normalize(toCity);
  if (!from || !to) return null;

  const matches = (haystack, needleKey) =>
    haystack.includes(needleKey) || needleKey.includes(haystack);

  for (const entry of DISTANCE_TABLE) {
    const aMatch = matches(from, entry.from) && matches(to, entry.to);
    const bMatch = matches(from, entry.to) && matches(to, entry.from);
    if (aMatch || bMatch) return entry.km;
  }
  return null;
}

export { DISTANCE_TABLE };
