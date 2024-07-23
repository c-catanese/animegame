import "./App.css";
import React, {useState, useEffect, useRef} from 'react';
import YouTube from 'react-youtube';
import GuessDisplay from "./GuessDisplay/GuessDisplay";
import Graph from "./Graph/Graph";
import EndGame from "./EndGame/EndGame";
import Share from "./Share/Share";
import Help from "./Help/Help";
import data from "./data.json"

function App() {
  const [guessList, setGuessList] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('')
  const [currentGuessNumber, setCurrentGuessNumber] = useState(1);
  const [userRecord, setUserRecord] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [animeDB, setAnimeDB] = useState([]);
  const [answer, setAnswer] = useState('')
  const [answerVideo, setAnswerVideo] = useState('')
  const [filteredList, setFilteredList] = useState([])
  const [winner, setWinner] = useState(null)
  const [formattedDate, setFormattedDate] = useState('');
  const [sharePopup, setSharePopup] = useState(null)
  const [showScores, setShowScores] = useState(false);
  const [help, setHelp] = useState(false)
  const [graphButtonAvail, setGraphButtonAvail] = useState(null)
  const [gameNumber, setGameNumber] = useState(0);



  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    console.log('tick');
    return () => {
      clearInterval(timerID);
    };
  }, []);

  const tick = () => {
    const currentDate = new Date();
    const formattedDateTemp = currentDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    setFormattedDate(formattedDateTemp);

    const storedDate = JSON.parse(localStorage.getItem('todayDate'));

    if (!storedDate) {
      localStorage.setItem('todayDate', JSON.stringify(formattedDateTemp));
    } else if (storedDate !== formattedDateTemp) {
      console.log('test')
      localStorage.setItem('todayDate', JSON.stringify(formattedDateTemp));
      localStorage.setItem('gameStatus', JSON.stringify(null));
      localStorage.setItem('todaysGuesses', JSON.stringify(null));
    }
  };

  function toTitleCase(str) {
    if (str) {
      return str.replace(/\b\w/g, char => char.toUpperCase())
                .replace(/'\w/g, match => match.charAt(0) + match.charAt(1).toLowerCase());
    }
    return '';
  }

  useEffect(() => {
    // Retrieve user record from localStorage
    let userRecord = JSON.parse(localStorage.getItem('userRecord'));
    if(userRecord){
      setUserRecord(userRecord)
    }


    let hasPlayed = JSON.parse(localStorage.getItem('hasPlayed'))
    if(hasPlayed){
      setGraphButtonAvail(true)
    } else{
      setGraphButtonAvail(false)
      setHelp(false)
    }

    // If no user record exists, initialize with zeros
    if (!userRecord) {
      userRecord = {1: 0, 2: 0, 3: 0, 'x': 0 };
      localStorage.setItem('userRecord', JSON.stringify(userRecord));
      setUserRecord(userRecord)
    };
    
    // Retrieve today's guesses from localStorage
    const todaysGuesses = JSON.parse(localStorage.getItem('todaysGuesses'));
    // If today's guesses exist, update the guess list state
    if (todaysGuesses?.length) {
      setGuessList(todaysGuesses);
      setCurrentGuessNumber(todaysGuesses.length + 1)
    }

    const gS = JSON.parse(localStorage.getItem('gameStatus'));
    if (gS !== null) {
      setGameStatus(gS);
    }
  }, []);

  useEffect(() => {
    if (formattedDate) {
      // Ensure process.env.answersDB and process.env.animeDB are defined and have the date key
      const answersDBEntry = data.answers_db?.[formattedDate];
      const animeDB = data.anime_db

      if (answersDBEntry) {
        setAnswer(answersDBEntry.name);
        setAnswerVideo(answersDBEntry.link);
        setGameNumber(answersDBEntry.number)
      } else {
        console.error(`No entry found for date ${formattedDate} in answersDB`);
      }

      if (animeDB) {
        setAnimeDB(animeDB);
      } 
    }
  }, [formattedDate])


  //handle the user changing their current guess
  const handleChange = (event) => {
    // Get the current input value and convert it to lowercase for case-insensitive comparison
    const guess = event.target.value.toLowerCase();
  
    // Update the current guess state with the new guess
    setCurrentGuess(guess);
  
    // Filter the anime list based on the current guess
    const filteredList = animeDB.filter(name => 
      // Check if the name starts with the current guess
      name.toLowerCase().startsWith(guess.toLowerCase()) && 
      // Ensure the name is not already in the guessList
      !guessList.some(guessItem => 
        guessItem.guessName && 
        typeof guessItem.guessName === 'string' && 
        guessItem.guessName.toLowerCase() === name.toLowerCase()
      ));
  
    // Update the filtered list state with the new filtered list
    setFilteredList(filteredList);
  };
  
  //handle the user pressing enter with a guess -> this needs to check if it is a valid guess
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if(filteredList.length===1){
        handleSubmit(filteredList[0]);
      }
      if(animeDB.includes(currentGuess) && !guessList.includes(currentGuess)){
        handleSubmit(currentGuess.toLowerCase());
      } 
    }
  };

  const handleSubmit = (newGuess) => {
    if(animeDB.includes(newGuess)){
      setGuessList([...guessList, {'guessNumber': currentGuessNumber, 'guessName': newGuess}]);
      localStorage.setItem('todaysGuesses', JSON.stringify([...guessList, {'guessNumber': currentGuessNumber, 'guessName': newGuess}]));
      setCurrentGuessNumber(currentGuessNumber + 1)
      // Handle submission logic here
      if(answer === newGuess){
        const updatedRecord = {...userRecord, [currentGuessNumber]: userRecord[currentGuessNumber] + 1};
        setUserRecord(updatedRecord)
        setGameStatus(true)
        setGraphButtonAvail(true)
        setWinner(true);
        localStorage.setItem('gameStatus', JSON.stringify(true));
        localStorage.setItem('userRecord', JSON.stringify(updatedRecord))
        localStorage.setItem('hasPlayed', true);
        if(isPlaying){
          handleTogglePlay();
        }
      } else if(currentGuessNumber === 3){
        setWinner(false)
        setGameStatus(false)
        setGraphButtonAvail(true)
        const updatedRecord = {...userRecord, x: userRecord['x'] + 1};
        setUserRecord(updatedRecord)
        localStorage.setItem('userRecord', JSON.stringify(updatedRecord))
        localStorage.setItem('gameStatus', JSON.stringify(false));
        localStorage.setItem('hasPlayed', true);
        if(isPlaying){
          handleTogglePlay();
        }
      }
      setCurrentGuess('');
    } 
    else{
    }
  };

  const playerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    const player = playerRef.current.internalPlayer;
    if (isPlaying) { // If video is playing
      player.pauseVideo();
      setIsPlaying(false)
    } else {
      player.playVideo();
      setIsPlaying(true)
    }
  };

  const handleRewindFastForward = (seconds) => {
    const player = playerRef.current.getInternalPlayer();
    // Use the YouTube Player API to seek forward or backward by a certain amount of time
    player.seekTo(player.getCurrentTime() + seconds, true);
  };

  const selectAutofilledAnswer = (name) => {
    setCurrentGuess(name)
    handleSubmit(name)
  }

  const showScoreboard = () => {
    setShowScores(!showScores);
  }

  const showHelp  = () => {
    setHelp(!help)
  }

  const showAnswer = () => {
    setWinner(gameStatus)
  }

  const copyToClipboard = async () => {
    const squares = Array.from({ length: 3 }, (_, i) => {
      if (i === guessList.length - 1) {
        return '🟩';
      } else if (i < guessList.length - 1) {
        return '🟥';
      } else {
        return '⬜';
      }
    }).join('');

    const text = `Weeble #${gameNumber} ${guessList.length}/3\n${squares}\n#weeble #anime #wordle\nhttps://theweeble.com`
    try {
      await navigator.clipboard.writeText(text);
      setSharePopup(true)
      setTimeout(() => setSharePopup(null), 2000);
    } catch (err) {
      setSharePopup(false)
      setTimeout(() => setSharePopup(null), 2000);
      console.log('error')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="leftHeaderButtonContainer">
          {/* <button onClick={() => {localStorage.clear()}} className="headerButton">C</button> */}
          {gameStatus && 
            <button className="headerButton" onClick={copyToClipboard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M18 22q-1.25 0-2.125-.875T15 19q0-.175.025-.363t.075-.337l-7.05-4.1q-.425.375-.95.588T6 15q-1.25 0-2.125-.875T3 12t.875-2.125T6 9q.575 0 1.1.213t.95.587l7.05-4.1q-.05-.15-.075-.337T15 5q0-1.25.875-2.125T18 2t2.125.875T21 5t-.875 2.125T18 8q-.575 0-1.1-.212t-.95-.588L8.9 11.3q.05.15.075.338T9 12t-.025.363t-.075.337l7.05 4.1q.425-.375.95-.587T18 16q1.25 0 2.125.875T21 19t-.875 2.125T18 22"/></svg>
            </button>
          }
        </div>
        <img className="logo" src="/weebleLogo.png" alt="error"/>
        <div className="rightHeaderButtonContainer">
          {graphButtonAvail && 
            <button className="headerButton" aria-label="show scores" onClick={showScoreboard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M16 20v-7h4v7zm-6 0V4h4v16zm-6 0V9h4v11z"/></svg>
            </button>
          }
          <button className="headerButton" aria-label="help" onClick={showHelp}>
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44c.91-1.29.4-3.7-2.18-3.7c-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41c.7 1.15 1.11 3.3.03 4.9c-1.2 1.77-2.35 2.31-2.97 3.45c-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15M14 20c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2"/></svg>
          </button>
        </div>
      </header>
      <div className="container">
      
        <div className="input-container" style={{height: currentGuess.length > 0 && filteredList.length > 0 ? (filteredList.length * 40 + 110) + 'px' : '90px' }}>
          {!gameStatus && currentGuessNumber !== 4 && <input className="guess-input" placeholder="Search" value={currentGuess} onChange={handleChange} onKeyDown={handleKeyPress}/>}
          {!gameStatus && currentGuessNumber=== 4 && <p className="end-message " >Better Luck Tomorrow!</p>}
          {gameStatus && 
            <>
              <p className="end-message">  Congrats! You Got Today's Answer in {guessList.length} {currentGuessNumber > 2 ? 'Tries!' : 'Try!'}</p> 
            </>}
            {filteredList.length > 0 && currentGuess.length > 0 && 
              <div className="autofill-guess-container" style={{height:(filteredList.length * 40 + 20)+'px', }}> 
                {filteredList.map((name, index) => (
                  <button className="autofill-guess" key={index} onClick={() => selectAutofilledAnswer(name)}>{toTitleCase(name)}</button>
                ))}
              </div>
              }
        </div>
        <div className="guess-info-container">
          {guessList.length > 0 && guessList.slice().reverse().map((guess, index) => (
              <GuessDisplay guess={guess} index={index} gameStatus={gameStatus} toTitleCase={toTitleCase}/>
          ))}
        </div>

        <div className="video-buttons-container">
          <button className="video-button" aria-label="restart video" onClick={() => handleRewindFastForward(-10)}><svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24"><path fill="white" d="M6 13c0-1.65.67-3.15 1.76-4.24L6.34 7.34A8.014 8.014 0 0 0 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91m14 0c0-4.42-3.58-8-8-8c-.06 0-.12.01-.18.01l1.09-1.09L11.5 2.5L8 6l3.5 3.5l1.41-1.41l-1.08-1.08c.06 0 .12-.01.17-.01c3.31 0 6 2.69 6 6c0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93"/></svg>
          </button>
          {isPlaying && <p className="playingText">Playing...</p>}
          {!isPlaying && <p className="playingText">Paused</p>}
           <button className="video-button" aria-label="play or pause" onClick={() => handleTogglePlay()}> {isPlaying ?<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 14 14"><path fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" d="M4 .5H1.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H4a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1m8.5 0H10a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1"/> </svg>: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 14 14"><path fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" d="M1.436 12.33a1.14 1.14 0 0 0 .63 1a1.24 1.24 0 0 0 1.22 0l8.65-5.35a1.11 1.11 0 0 0 0-2L3.286.67a1.24 1.24 0 0 0-1.22 0a1.14 1.14 0 0 0-.63 1z"/> </svg>}
          </button>
        </div>
        
        {gameStatus!==null && <button onClick={showAnswer} className="showAnswerButton">Show Answer</button>}

        {showScores && 
          <Graph userRecord={userRecord} showScoreboard={showScoreboard}/>
        }
        {winner!==null && 
          <EndGame winner={winner} setWinner={setWinner} answer={answer} guessList={guessList} answerVideo={answerVideo}  toTitleCase={toTitleCase}/>
        }
        {sharePopup !== null &&
          <Share status={sharePopup}/>
        }

        {help &&
          <Help toggleHelp={showHelp}/>
        }
      </div>
      <YouTube style={{zIndex:'-100', position: 'absolute', top: '0', left: '0'}} videoId={answerVideo} opts={{ playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: answerVideo }, height: '0', width: '0'}} ref={playerRef}/>
    </div>
  );
}

export default App;
