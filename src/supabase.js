import { createClient } from '@supabase/supabase-js';
import { getTodayUTC } from './dailyPuzzle';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Submit a score for today's puzzle.
 * Uses an upsert with raw SQL increment via RPC to avoid race conditions.
 * @param {number|string} guessCount - 1-5 for wins, 'x' for loss
 */
export async function submitDailyScore(guessCount) {
  const today = getTodayUTC();
  const key = String(guessCount);

  try {
    const { error } = await supabase.rpc('increment_score', {
      score_date: today,
      guess_key: key,
    });
    if (error) console.error('Failed to submit score:', error.message);
  } catch (err) {
    console.error('Failed to submit score:', err);
  }
}

/**
 * Fetch today's aggregate scores.
 * Returns { 1: count, 2: count, ..., 5: count, x: count } or null.
 */
export async function fetchDailyScores() {
  const today = getTodayUTC();

  try {
    const { data, error } = await supabase
      .from('daily_scores')
      .select('guess_key, count')
      .eq('score_date', today);

    if (error) {
      console.error('Failed to fetch scores:', error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    const scores = {};
    data.forEach(row => {
      scores[row.guess_key] = row.count;
    });
    return scores;
  } catch (err) {
    console.error('Failed to fetch scores:', err);
    return null;
  }
}
