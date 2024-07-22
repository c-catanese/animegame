import React, {useState, useEffect, useRef} from 'react';
import styles from "./EndGame.module.scss"
import YouTube from 'react-youtube';


function EndGame({ winner, setWinner, answer, guessList, answerVideo, toTitleCase }){
 //style={{backgroundColor: winner ? '#739e82' : '#640D14'}}
  return (
    <div className={styles.blurBackground}>
      <div className={styles.endGame} >
        <button className={styles.closeEndGame} onClick={()=> {setWinner(null)}}>X</button>
        {winner ? <p style={{width: '250px'}}>Congrats! <br/> You Got Today's Answer in {guessList.length} {guessList.length > 1 ? 'Tries!' : 'Try!'}</p> : <p style={{width: '250px'}}>Nice Try!<br/>Better Luck Tomorrow!</p> }
        
        <YouTube videoId={answerVideo} opts={{ playerVars: { autoplay: 0, controls: 1, loop: 1, playlist: answerVideo }, height: '180', width: '320'}}/>
        <p style={{marginTop: '20px'}}>Today's Answer:<br/>{toTitleCase(answer)}</p>
      </div>
    </div>
  )
}

export default EndGame