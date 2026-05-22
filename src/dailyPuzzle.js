// Epoch: the original game start date
const EPOCH = Date.UTC(2024, 8, 23); // Sept 23, 2024 UTC
const GAME_NUMBER_OFFSET = 65;
const SEED_SALT = 0x57454542; // "WEEB" in hex
const MS_PER_DAY = 86400000;

/**
 * mulberry32 — a fast, deterministic 32-bit PRNG.
 * Produces identical results in every JS engine.
 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded RNG.
 * Returns a new shuffled array of indices.
 */
function seededShuffle(length, rng) {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Get the current day number since epoch (in UTC).
 */
function getDayNumber() {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((todayUTC - EPOCH) / MS_PER_DAY);
}

/**
 * Get today's date string in ISO format (UTC).
 */
export function getTodayUTC() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Returns the daily puzzle: { name, videoUrl, gameNumber }
 * Deterministic — same catalog + same day = same result for all users.
 */
export function getDailyPuzzle(catalog) {
  if (!catalog || catalog.length === 0) return null;

  const dayNumber = getDayNumber();
  const gameNumber = dayNumber + GAME_NUMBER_OFFSET;

  // Create a seeded shuffle of the entire catalog
  const rng = mulberry32(SEED_SALT);
  const shuffled = seededShuffle(catalog.length, rng);

  // Pick today's entry by cycling through the shuffled order
  const catalogIndex = shuffled[dayNumber % catalog.length];
  const entry = catalog[catalogIndex];

  return {
    name: entry.name,
    videoUrl: entry.videoUrl,
    gameNumber,
  };
}

/**
 * Returns milliseconds until the next midnight UTC.
 */
export function getMillisUntilMidnightUTC() {
  const now = new Date();
  const tomorrowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return tomorrowUTC - now.getTime();
}
