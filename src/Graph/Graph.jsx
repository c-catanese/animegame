import React, { useEffect, useState } from 'react';
import styles from "./Graph.module.scss";
import { fetchDailyScores } from "../supabase";

const KEYS = ['1', '2', '3', '4', '5', 'x'];
const BAR_COLOR = '#f4a7b9';
const BAR_COLOR_FAIL = 'rgba(255, 255, 255, 0.15)';

function BarChart({ data, isPercentage }) {
  const maxValue = Math.max(...KEYS.map(k => data[k] || 0), 1);

  return (
    <div className={styles.chart}>
      {KEYS.map(key => {
        const value = data[key] || 0;
        const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const label = isPercentage ? `${value}%` : value;
        const isX = key === 'x';

        return (
          <div key={key} className={styles.barColumn}>
            <span className={styles.barValue}>{label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max(heightPct, 4)}%`,
                  backgroundColor: isX ? BAR_COLOR_FAIL : BAR_COLOR,
                }}
              />
            </div>
            <span className={styles.barLabel}>{isX ? 'X' : key}</span>
          </div>
        );
      })}
    </div>
  );
}

function Graph({ userRecord, showScoreboard }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyScores, setDailyScores] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') showScoreboard(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showScoreboard]);

  useEffect(() => {
    if (activeTab === 'daily' && !dailyScores) {
      setLoading(true);
      fetchDailyScores().then(scores => {
        setDailyScores(scores);
        setLoading(false);
      });
    }
  }, [activeTab, dailyScores]);

  function getStats(record) {
    const wins = (record[1] || 0) + (record[2] || 0) + (record[3] || 0) + (record[4] || 0) + (record[5] || 0);
    const total = wins + (record['x'] || 0);
    const pct = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
    return { wins, total, pct };
  }

  function getDailyPercentages(scores) {
    if (!scores) return null;
    const total = KEYS.reduce((sum, k) => sum + (scores[k] || 0), 0);
    if (total === 0) return null;
    const pcts = {};
    KEYS.forEach(k => {
      pcts[k] = Math.round(((scores[k] || 0) / total) * 100);
    });
    return pcts;
  }

  const stats = getStats(userRecord);
  const dailyPcts = getDailyPercentages(dailyScores);
  const dailyTotal = dailyScores ? KEYS.reduce((sum, k) => sum + (dailyScores[k] || 0), 0) : 0;

  return (
    <div className={styles.blurBackground} onClick={showScoreboard}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} aria-label="close scores" onClick={showScoreboard}>&times;</button>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'you' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('you')}
          >
            Your Scores
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'daily' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Today
          </button>
        </div>

        {activeTab === 'you' && (
          <>
            <BarChart data={userRecord} isPercentage={false} />
            <p className={styles.stats}>{stats.wins}/{stats.total} wins ({stats.pct}%)</p>
          </>
        )}

        {activeTab === 'daily' && (
          <>
            <BarChart data={dailyPcts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, x: 0 }} isPercentage={true} />
            <p className={styles.stats}>{loading ? 'Loading...' : "Today's results"}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Graph;
