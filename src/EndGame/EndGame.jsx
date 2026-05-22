import React, { useEffect } from 'react';
import styles from "./EndGame.module.scss"
import VideoComponent from '../VideoComponent/VideoComponent';

function EndGame({ winner, setWinner, answer, guessList, answerVideo, getDisplayName }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setWinner(null); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setWinner]);

  return (
    <div className={styles.blurBackground} onClick={() => setWinner(null)}>
      <div className={styles.endGame} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeEndGame} aria-label="close" onClick={() => setWinner(null)}>X</button>
        {winner
          ? <p style={{ width: '250px' }}>Congrats! <br /> You Got Today's Answer in {guessList.length} {guessList.length > 1 ? 'Tries!' : 'Try!'}</p>
          : <p style={{ width: '250px' }}>Nice Try!<br />Better Luck Tomorrow!</p>
        }
        <VideoComponent answerVideo={answerVideo} height="40px" width="300px" controls={true} />
        <p style={{ marginTop: '20px' }}>Today's Answer:<br />{getDisplayName(answer)}</p>
      </div>
    </div>
  )
}

export default EndGame
