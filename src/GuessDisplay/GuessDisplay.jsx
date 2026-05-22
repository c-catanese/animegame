import React from 'react';
import styles from "./GuessDisplay.module.scss"

function GuessDisplay({ guess, isCorrect, displayName }) {
  return (
    <div className={styles.guessInfo} style={{ backgroundColor: isCorrect ? 'var(--color-correct)' : 'var(--color-wrong)' }}>
      <p className={styles.guessNumber}>Guess #{guess.guessNumber}</p>
      <p className={styles.guessName}>{displayName}</p>
    </div>
  )
}

export default GuessDisplay
