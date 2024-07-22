import React from 'react';
import styles from "./Help.module.scss"

function Help({toggleHelp}){
  return (
    <div className={styles.blurBackground}>
      <div className={styles.container}>
        <button onClick={toggleHelp} className={styles.closeButton}>x</button>
        <div className={styles.row}>
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 14 14"><path fill="fill" stroke="black" strokeLinecap="round" strokeLinejoin="round" d="M1.436 12.33a1.14 1.14 0 0 0 .63 1a1.24 1.24 0 0 0 1.22 0l8.65-5.35a1.11 1.11 0 0 0 0-2L3.286.67a1.24 1.24 0 0 0-1.22 0a1.14 1.14 0 0 0-.63 1z"/> </svg>
          <p className={styles.rowText}>Press play and an anime intro will begin playing.</p>
        </div>
        <div className={styles.row}>
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2.5em" viewBox="0 0 20 14"><path fill="black" d="M16 20v-7h4v7zm-6 0V4h4v16zm-6 0V9h4v11z"/></svg>
          <p className={styles.rowText}>You have 3 tries to guess the correct song.</p>
        </div>
        <div className={styles.row}>
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="black" d="M18 22q-1.25 0-2.125-.875T15 19q0-.175.025-.363t.075-.337l-7.05-4.1q-.425.375-.95.588T6 15q-1.25 0-2.125-.875T3 12t.875-2.125T6 9q.575 0 1.1.213t.95.587l7.05-4.1q-.05-.15-.075-.337T15 5q0-1.25.875-2.125T18 2t2.125.875T21 5t-.875 2.125T18 8q-.575 0-1.1-.212t-.95-.588L8.9 11.3q.05.15.075.338T9 12t-.025.363t-.075.337l7.05 4.1q.425-.375.95-.587T18 16q1.25 0 2.125.875T21 19t-.875 2.125T18 22"/></svg>
          <p className={styles.rowText}>Share your score when you are finished!</p>
        </div>
        <div className={styles.row}>
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="black" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.2 4.2 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.52 8.52 0 0 1-5.33 1.84q-.51 0-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23"/></svg>
          <p className={styles.rowText}>Tweet your scores to me! <a href="https://x.com/chrstnctns" target="_blank">@chrstnctns</a></p>
        </div>

      </div>
    </div>
  )
}

export default Help