import React from 'react';
import styles from "./GuessDisplay.module.scss"

function GuessDisplay({guess, index, gameStatus, toTitleCase}){
  return (
    <div className={styles.guessInfo} style={{backgroundColor: gameStatus && index===0 ? '#739e82' : '#640D14'}} key={index}>
      <p className={styles.guessNumber}>Guess #{guess['guessNumber']}</p>
      <p className={styles.guessName}>{toTitleCase(guess['guessName'])}</p>
    </div>
  )
}

export default GuessDisplay