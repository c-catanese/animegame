import { describe, it, expect } from 'vitest';
import { getDailyPuzzle, getMillisUntilMidnightUTC, getTodayUTC } from './dailyPuzzle';

const mockCatalog = [
  { name: 'attack on titan', videoUrl: 'https://v.animethemes.moe/ShingekiNoKyojin-OP1.webm' },
  { name: 'one punch man', videoUrl: 'https://v.animethemes.moe/OnePunchMan-OP1.webm' },
  { name: 'steins;gate', videoUrl: 'https://v.animethemes.moe/SteinsGate-OP1.webm' },
  { name: 'death note', videoUrl: 'https://v.animethemes.moe/DeathNote-OP1.webm' },
  { name: 'demon slayer', videoUrl: 'https://v.animethemes.moe/KimetsuNoYaiba-OP1.webm' },
];

describe('getDailyPuzzle', () => {
  it('returns a valid catalog entry', () => {
    const result = getDailyPuzzle(mockCatalog);
    expect(result).not.toBeNull();
    expect(result.name).toBeTruthy();
    expect(result.videoUrl).toBeTruthy();
    expect(typeof result.gameNumber).toBe('number');
  });

  it('returns the same result when called multiple times on the same day', () => {
    const result1 = getDailyPuzzle(mockCatalog);
    const result2 = getDailyPuzzle(mockCatalog);
    expect(result1).toEqual(result2);
  });

  it('returns a result from the catalog', () => {
    const result = getDailyPuzzle(mockCatalog);
    const match = mockCatalog.find(e => e.name === result.name && e.videoUrl === result.videoUrl);
    expect(match).toBeDefined();
  });

  it('includes a game number >= 65', () => {
    const result = getDailyPuzzle(mockCatalog);
    expect(result.gameNumber).toBeGreaterThanOrEqual(65);
  });

  it('handles a catalog of length 1', () => {
    const single = [{ name: 'test', videoUrl: 'https://example.com/test.webm' }];
    const result = getDailyPuzzle(single);
    expect(result.name).toBe('test');
  });

  it('returns null for empty catalog', () => {
    expect(getDailyPuzzle([])).toBeNull();
    expect(getDailyPuzzle(null)).toBeNull();
  });
});

describe('getMillisUntilMidnightUTC', () => {
  it('returns a positive number', () => {
    const ms = getMillisUntilMidnightUTC();
    expect(ms).toBeGreaterThan(0);
  });

  it('returns less than 24 hours', () => {
    const ms = getMillisUntilMidnightUTC();
    expect(ms).toBeLessThanOrEqual(86400000);
  });
});

describe('getTodayUTC', () => {
  it('returns a date string in YYYY-MM-DD format', () => {
    const today = getTodayUTC();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
