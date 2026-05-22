import "./App.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GuessDisplay from "./GuessDisplay/GuessDisplay";
import Graph from "./Graph/Graph";
import EndGame from "./EndGame/EndGame";
import Share from "./Share/Share";
import Help from "./Help/Help";
import catalog from "./catalog.json";
import LoadingScreen from "./LoadingScreen/LoadingScreen";
import VideoComponent from "./VideoComponent/VideoComponent";
import { getDailyPuzzle, getMillisUntilMidnightUTC, getTodayUTC } from "./dailyPuzzle";
import SceneParallax from "./SceneParallax";

const MAX_GUESSES = 3;
const MAX_AUTOCOMPLETE = 8;
const AUTOFILL_ITEM_HEIGHT = 50;
const INPUT_BASE_HEIGHT = 110;

// Build a lookup map: name → catalog entry (for quick access to englishName)
const catalogMap = new Map();
catalog.catalog.forEach(entry => {
  catalogMap.set(entry.name, entry);
});

// All searchable names: each entry can be found by its primary name or English name
const allNames = catalog.catalog.map(entry => entry.name);

function getDisplayName(name) {
  const entry = catalogMap.get(name);
  if (!entry) return toTitleCase(name);
  if (entry.englishName && entry.englishName !== entry.name) {
    return `${toTitleCase(entry.englishName)}  (${toTitleCase(entry.name)})`;
  }
  return toTitleCase(entry.name);
}

function getShortDisplayName(name) {
  const entry = catalogMap.get(name);
  if (!entry) return toTitleCase(name);
  if (entry.englishName) return toTitleCase(entry.englishName);
  return toTitleCase(entry.name);
}

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase())
            .replace(/'\w/g, match => match.charAt(0) + match.charAt(1).toLowerCase());
}

function App() {
  const [guessList, setGuessList] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentGuessNumber, setCurrentGuessNumber] = useState(1);
  const [userRecord, setUserRecord] = useState({ 1: 0, 2: 0, 3: 0, 'x': 0 });
  const [gameStatus, setGameStatus] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answerVideo, setAnswerVideo] = useState('');
  const [winner, setWinner] = useState(null);
  const [sharePopup, setSharePopup] = useState(null);
  const [showScores, setShowScores] = useState(false);
  const [help, setHelp] = useState(false);
  const [graphButtonAvail, setGraphButtonAvail] = useState(false);
  const [gameNumber, setGameNumber] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef(null);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize daily puzzle
  useEffect(() => {
    const puzzle = getDailyPuzzle(catalog.catalog);
    if (puzzle) {
      setAnswer(puzzle.name);
      setAnswerVideo(puzzle.videoUrl);
      setGameNumber(puzzle.gameNumber);
    }
  }, []);

  // Schedule refresh at midnight UTC
  useEffect(() => {
    const ms = getMillisUntilMidnightUTC();
    const timer = setTimeout(() => window.location.reload(), ms);
    return () => clearTimeout(timer);
  }, []);

  // Restore state from localStorage on mount
  useEffect(() => {
    // Load user record
    try {
      const savedRecord = JSON.parse(localStorage.getItem('userRecord'));
      if (savedRecord && typeof savedRecord === 'object' && 'x' in savedRecord) {
        setUserRecord(savedRecord);
      } else {
        const fresh = { 1: 0, 2: 0, 3: 0, 'x': 0 };
        localStorage.setItem('userRecord', JSON.stringify(fresh));
        setUserRecord(fresh);
      }
    } catch {
      const fresh = { 1: 0, 2: 0, 3: 0, 'x': 0 };
      localStorage.setItem('userRecord', JSON.stringify(fresh));
      setUserRecord(fresh);
    }

    const storedDate = localStorage.getItem('todayDate');
    const todayUTC = getTodayUTC();

    if (storedDate !== todayUTC) {
      localStorage.setItem('todayDate', todayUTC);
      localStorage.removeItem('gameStatus');
      localStorage.removeItem('todaysGuesses');
      return;
    }

    try {
      const todaysGuesses = JSON.parse(localStorage.getItem('todaysGuesses'));
      if (Array.isArray(todaysGuesses) && todaysGuesses.length > 0) {
        setGuessList(todaysGuesses);
        setCurrentGuessNumber(todaysGuesses.length + 1);
      }

      const gS = JSON.parse(localStorage.getItem('gameStatus'));
      if (gS !== null) {
        setGameStatus(gS);
      }
    } catch {
      // Corrupted localStorage — start fresh
    }

    const hasPlayed = localStorage.getItem('hasPlayed');
    setGraphButtonAvail(!!hasPlayed);
  }, []);

  // Filtered autocomplete list — searches both Japanese and English names, capped
  const filteredList = useMemo(() => {
    if (!currentGuess) return [];
    const guess = currentGuess.toLowerCase();
    const alreadyGuessed = new Set(guessList.map(g => g.guessName));
    const results = [];

    for (const entry of catalog.catalog) {
      if (alreadyGuessed.has(entry.name)) continue;

      const matchesJP = entry.name.startsWith(guess);
      const matchesEN = entry.englishName && entry.englishName.startsWith(guess);

      if (matchesJP || matchesEN) {
        results.push(entry.name);
        if (results.length >= MAX_AUTOCOMPLETE) break;
      }
    }

    return results;
  }, [currentGuess, guessList]);

  const handleChange = useCallback((event) => {
    setCurrentGuess(event.target.value.toLowerCase());
  }, []);

  const handleSubmit = useCallback((newGuess) => {
    if (!allNames.includes(newGuess)) return;

    const newGuessList = [...guessList, { guessNumber: currentGuessNumber, guessName: newGuess }];

    setGuessList(newGuessList);
    localStorage.setItem('todaysGuesses', JSON.stringify(newGuessList));
    setCurrentGuessNumber(currentGuessNumber + 1);

    if (answer === newGuess) {
      const updatedRecord = { ...userRecord, [currentGuessNumber]: userRecord[currentGuessNumber] + 1 };
      setUserRecord(updatedRecord);
      setGameStatus(true);
      setGraphButtonAvail(true);
      setWinner(true);
      localStorage.setItem('gameStatus', JSON.stringify(true));
      localStorage.setItem('userRecord', JSON.stringify(updatedRecord));
      localStorage.setItem('hasPlayed', 'true');
      if (isPlaying) handleTogglePlay();
    } else if (currentGuessNumber >= MAX_GUESSES) {
      const updatedRecord = { ...userRecord, x: userRecord['x'] + 1 };
      setUserRecord(updatedRecord);
      setWinner(false);
      setGameStatus(false);
      setGraphButtonAvail(true);
      localStorage.setItem('userRecord', JSON.stringify(updatedRecord));
      localStorage.setItem('gameStatus', JSON.stringify(false));
      localStorage.setItem('hasPlayed', 'true');
      if (isPlaying) handleTogglePlay();
    }

    setCurrentGuess('');
  }, [currentGuessNumber, guessList, answer, userRecord, isPlaying]);

  const handleKeyPress = useCallback((event) => {
    if (event.key !== 'Enter') return;
    if (filteredList.length === 1) {
      handleSubmit(filteredList[0]);
    } else if (allNames.includes(currentGuess) && !guessList.some(g => g.guessName === currentGuess)) {
      handleSubmit(currentGuess.toLowerCase());
    }
  }, [filteredList, currentGuess, guessList, handleSubmit]);

  const handleTogglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleRestartVideo = useCallback(() => {
    const player = playerRef.current;
    if (player) player.currentTime = 0;
  }, []);

  const selectAutofilledAnswer = useCallback((name) => {
    setCurrentGuess(name);
    handleSubmit(name);
  }, [handleSubmit]);

  const showScoreboard = useCallback(() => {
    setShowScores(prev => !prev);
  }, []);

  const showHelpModal = useCallback(() => {
    setHelp(prev => !prev);
  }, []);

  const showAnswer = useCallback(() => {
    setWinner(gameStatus);
  }, [gameStatus]);

  const copyToClipboard = useCallback(async () => {
    const squares = Array.from({ length: MAX_GUESSES }, (_, i) => {
      if (i === guessList.length - 1) return '\u{1F7E9}';
      if (i < guessList.length - 1) return '\u{1F7E5}';
      return '\u2B1C';
    }).join('');

    const text = `Weeble #${gameNumber} ${guessList.length}/${MAX_GUESSES}\n${squares}\n#weeble #anime #wordle\nhttps://theweeble.com`;
    try {
      await navigator.clipboard.writeText(text);
      setSharePopup(true);
      setTimeout(() => setSharePopup(null), 2000);
    } catch {
      setSharePopup(false);
      setTimeout(() => setSharePopup(null), 2000);
    }
  }, [gameNumber, guessList]);

  const gameOver = gameStatus !== null;
  const outOfGuesses = currentGuessNumber > MAX_GUESSES;

  return (
    <>
      <SceneParallax />

      {/* Page layout with ad slots */}
      <div className="page-layout">
        <div className="ad-slot ad-slot-top">Ad</div>
        <div className="game-wrapper">
    <div className="app">
      {!isReady && <LoadingScreen />}
      {isReady && (
        <>
          <header className="header">
            <h1>Weeble #{gameNumber}</h1>
            <nav>
              <div className="leftHeaderButtonContainer">
                {gameStatus &&
                  <button className="headerButton" aria-label="share score" onClick={copyToClipboard}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M18 22q-1.25 0-2.125-.875T15 19q0-.175.025-.363t.075-.337l-7.05-4.1q-.425.375-.95.588T6 15q-1.25 0-2.125-.875T3 12t.875-2.125T6 9q.575 0 1.1.213t.95.587l7.05-4.1q-.05-.15-.075-.337T15 5q0-1.25.875-2.125T18 2t2.125.875T21 5t-.875 2.125T18 8q-.575 0-1.1-.212t-.95-.588L8.9 11.3q.05.15.075.338T9 12t-.025.363t-.075.337l7.05 4.1q.425-.375.95-.587T18 16q1.25 0 2.125.875T21 19t-.875 2.125T18 22"/></svg>
                  </button>
                }
              </div>
              <img className="logo" src="/weebleLogo.png" alt="Weeble logo" />
              <div className="rightHeaderButtonContainer">
                {graphButtonAvail &&
                  <button className="headerButton" aria-label="show scores" onClick={showScoreboard}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M16 20v-7h4v7zm-6 0V4h4v16zm-6 0V9h4v11z"/></svg>
                  </button>
                }
                <button className="headerButton" aria-label="help" onClick={showHelpModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44c.91-1.29.4-3.7-2.18-3.7c-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41c.7 1.15 1.11 3.3.03 4.9c-1.2 1.77-2.35 2.31-2.97 3.45c-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15M14 20c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2"/></svg>
                </button>
              </div>
            </nav>
          </header>
          <div className="container">
            <div className="input-container">
              {!gameStatus && !outOfGuesses &&
                <input
                  className="guess-input"
                  placeholder="Search"
                  aria-label="Guess the anime"
                  value={currentGuess}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                />
              }
              {!gameStatus && outOfGuesses &&
                <p className="end-message">Better Luck Tomorrow!</p>
              }
              {gameStatus &&
                <p className="end-message">
                  Congrats! You Got Today's Answer in {guessList.length} {guessList.length > 1 ? 'Tries!' : 'Try!'}
                </p>
              }
              {filteredList.length > 0 && currentGuess.length > 0 &&
                <div className="autofill-guess-container">
                  {filteredList.map((name) => (
                    <button className="autofill-guess" key={name} onClick={() => selectAutofilledAnswer(name)}>
                      {getDisplayName(name)}
                    </button>
                  ))}
                </div>
              }
            </div>
            <div className="guess-info-container">
              {guessList.length > 0 && guessList.slice().reverse().map((guess) => (
                <GuessDisplay
                  key={guess.guessNumber}
                  guess={guess}
                  isCorrect={gameStatus === true && guess.guessNumber === guessList.length}
                  displayName={getShortDisplayName(guess.guessName)}
                />
              ))}
            </div>

            <div className="video-buttons-container">
              <button className="video-button" aria-label="restart video" onClick={handleRestartVideo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24"><path fill="white" d="M6 13c0-1.65.67-3.15 1.76-4.24L6.34 7.34A8.014 8.014 0 0 0 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91m14 0c0-4.42-3.58-8-8-8c-.06 0-.12.01-.18.01l1.09-1.09L11.5 2.5L8 6l3.5 3.5l1.41-1.41l-1.08-1.08c.06 0 .12-.01.17-.01c3.31 0 6 2.69 6 6c0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93"/></svg>
              </button>
              <p className="playingText">{isPlaying ? 'Playing...' : 'Paused'}</p>
              <button className="video-button" aria-label="play or pause" onClick={handleTogglePlay}>
                {isPlaying
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 14 14"><path fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" d="M4 .5H1.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H4a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1m8.5 0H10a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 14 14"><path fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" d="M1.436 12.33a1.14 1.14 0 0 0 .63 1a1.24 1.24 0 0 0 1.22 0l8.65-5.35a1.11 1.11 0 0 0 0-2L3.286.67a1.24 1.24 0 0 0-1.22 0a1.14 1.14 0 0 0-.63 1z"/></svg>
                }
              </button>
            </div>

            {gameOver && <button onClick={showAnswer} className="showAnswerButton" aria-label="show answer">Show Answer</button>}

            {showScores && <Graph userRecord={userRecord} showScoreboard={showScoreboard} />}
            {winner !== null && <EndGame winner={winner} setWinner={setWinner} answer={answer} guessList={guessList} answerVideo={answerVideo} getDisplayName={getShortDisplayName} />}
            {sharePopup !== null && <Share status={sharePopup} />}
            {help && <Help toggleHelp={showHelpModal} />}
          </div>
          <VideoComponent ref={playerRef} answerVideo={answerVideo} height="0px" width="0px" controls={false} />
        </>
      )}
    </div>
        </div>
        <div className="ad-slot ad-slot-right">Ad</div>
        <div className="ad-slot ad-slot-bottom">Ad</div>
      </div>
    </>
  );
}

export default App;
