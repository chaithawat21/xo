import { useState, useEffect } from "react";


function App() {
  const player1 = "X";
  const player2 = "O";

  const [isPlayer1, setIsPlayer1] = useState<boolean>(true); // true = player 1, false = player 2 or bot 
  const [values, setValues] = useState<(string | null)[]>(Array(9).fill(null)); // "X", "O", or null
  const [winner, setWinner] = useState<string | null>(null); // "X", "O", or "DRAW"
  const [winningIndices, setWinningIndices] = useState<number[]>([]); // for styling the winning line

  // Replay mode state /////////////////////////////////// 
  const [history, setHistory] = useState<Array<(string | null)[]>>([
    Array(9).fill(null),
  ]); // store board state to replaying the game
  const [isReplaying, setIsReplaying] = useState<boolean>(false); // true = replay mode on
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Game mode state /////////////////////////////////// 
  const [gameMode, setGameMode] = useState<"PLAYER" | "BOT">("PLAYER"); // game mode by player or bot

  // Handles player move /////////////////////////////////// 
  const handleClick = (index: number) => {
    if (winner || values[index] || isReplaying) return;

    const newValues = values.slice();
    newValues[index] = isPlayer1 ? player1 : player2;
    setValues(newValues);
    setHistory([...history, newValues]); // store replay mode state 
    setIsPlayer1(!isPlayer1);

    checkWinner(newValues);
  };

  // Checks winner or draw ///////////////////////////////////
  const checkWinner = (values: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (values[a] && values[a] === values[b] && values[a] === values[c]) {
        setWinner(values[a]);
        setWinningIndices([a, b, c]);
        return;
      }
    }

    if (values.every((value) => value !== null)) {
      setWinner("DRAW");
    }
  };

  // Reset gmae ///////////////////////////////////
  const handleReset = () => {
    setValues(Array(9).fill(null));
    setWinner(null);
    setWinningIndices([]); // Reset winning indices
    setIsPlayer1(true);
    setHistory([Array(9).fill(null)]);
    setIsReplaying(false);
    setReplayIndex(0);
    setIsPlaying(false);
  };


  // Replay mode ///////////////////////////////////
  const handleReplay = () => {
    setIsReplaying(true);
    setReplayIndex(0);
    setIsPlaying(true);
  };
  // Navigate through the history of moves during replay ///////////////////////////////////
  const handleNext = () => {
    if (replayIndex < history.length - 1) {
      setReplayIndex(replayIndex + 1);
      setValues(history[replayIndex + 1]);
    }
  };
  const handlePrevious = () => {
    if (replayIndex > 0) {
      setReplayIndex(replayIndex - 1);
      setValues(history[replayIndex - 1]);
    }
  };

  // Control the playback of the replay ///////////////////////////////////
  const handlePause = () => {
    setIsPlaying(false);
  };
  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Automatic Replay Control /////////////////////////////////// 
  useEffect(() => {
    let replayTimer: NodeJS.Timeout;
    if (isPlaying && replayIndex < history.length - 1) {
      replayTimer = setTimeout(() => {
        setReplayIndex(replayIndex + 1);
        setValues(history[replayIndex + 1]);
      }, 1000);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(replayTimer);
  }, [isPlaying, replayIndex, history]);
 

  // styling helper ///////////////////////////////////
  // Board CSS
  const xoCell = (index: number) =>
    `bg-gray-300 cursor-pointer flex flex-row justify-center items-center rounded-[20px] ${winningIndices.includes(index) ? "shadow-none outline outline-[1px] outline-gray-200" : ""
    }`;
  // Click Board CSS
  const xoClick = (value: string | null, index: number) =>
    `absolute text-[5rem] ${winningIndices.includes(index)
      ? "custom-text-xo font-bold "
      : value === player1
        ? "custom-drop-shadow text-gray-300 font-bold "
        : "custom-drop-shadow text-gray-300 font-bold "
    }`;
  // Show Result Game CSS
  const xoWinner = (player: string) => {
    if (winner === "DRAW") {
      return <span >DRAW</span>;
    }
    if (winner === player) {
      return <span >WIN</span>;
    }
    if (winner && winner !== player) {
      return <span >LOSE</span>;
    }
    return null;
  };

  // Minimax Algorithm ///////////////////////////////////
  const minimax = (
    newValues: (string | null)[], // current state "X", "O", or null
    depth: number, // recursion, indicating how far ahead the function is evaluating
    isMaximizing: boolean // bot move or player move
  ): number => {
    const scores: { [key: string]: number } = {
      X: -1, // player win
      O: 1, // bot win
      DRAW: 0, // draw
    };

    const result = getWinner(newValues); // first check winner
    if (result !== null) {
      return scores[result];
    }

    if (isMaximizing) { // true = bot find the move 
      let bestScore = -Infinity;
      for (let i = 0; i < newValues.length; i++) {
        if (newValues[i] === null) {
          newValues[i] = player2;
          let score = minimax(newValues, depth + 1, false);
          newValues[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore; // keeps track of the highest score and returns
    } else { // false = player find the move
      let bestScore = Infinity;
      for (let i = 0; i < newValues.length; i++) {
        if (newValues[i] === null) {
          newValues[i] = player1;
          let score = minimax(newValues, depth + 1, true);
          newValues[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore; // keeps track of the highest score and returns 
    }
  };

  // Minimax Algorithm find best move ///////////////////////////////////
  // over all possible moves, applies the minimax algorithm, and returns the index of the best move.
  const findBestMove = (newValues: (string | null)[]): number => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < newValues.length; i++) {
      if (newValues[i] === null) {
        newValues[i] = player2;
        let score = minimax(newValues, 0, false);
        newValues[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  // Minimax Algorithm check winner ///////////////////////////////////
  const getWinner = (values: (string | null)[]): string | null => {
    const lines = [
      [values[0], values[1], values[2]],
      [values[3], values[4], values[5]],
      [values[6], values[7], values[8]],
      [values[0], values[3], values[6]],
      [values[1], values[4], values[7]],
      [values[2], values[5], values[8]],
      [values[0], values[4], values[8]],
      [values[2], values[4], values[6]],
    ];

    for (let line of lines) {
      if (line[0] && line[0] === line[1] && line[0] === line[2]) {
        return line[0];
      }
    }

    if (values.every((value) => value !== null)) {
      return "DRAW";
    }
    return null;
  };

    // Bot move /////////////////////////////////// 
    useEffect(() => {
      if (!isPlayer1 && !winner && gameMode === "BOT") {
        const aiMove = findBestMove(values);
        handleClick(aiMove);
      }
    }, [isPlayer1, winner, values, gameMode]);

       // Switches between player and bot ///////////////////////////////////
   const handleGameModeChange = (mode: "PLAYER" | "BOT") => {
    setGameMode(mode);
    handleReset();
  };

  return (
    <main className="min-h-screen w-screen bg-gray-300 text-gray-50 flex flex-col  items-center">
      <div className="flex flex-row">
        <h1 className="custom-text-lg font-bold">X</h1><h1 className="custom-drop-shadow-lg text-[5rem] text-gray-300 font-bold ">O</h1>
      </div>
      <div className="radio-input mt-[1rem] ">
        <label className="label flex flex-row items-center gap-4">
          <input
            className=""
            type="radio"
            value="PLAYER"
            checked={gameMode === "PLAYER"}
            onChange={() => handleGameModeChange("PLAYER")}
          />
          <span className="check"></span>
          VS Player
        </label>
        <label className="label flex flex-row items-center gap-4 ml-[1rem]">
          <input
            className="radio__input"
            type="radio"
            value="BOT"
            checked={gameMode === "BOT"}
            onChange={() => handleGameModeChange("BOT")}
          />
          <span className="check"></span>
          VS AI
        </label>
      </div>
      <div className="flex flex-row justify-center items-center gap-[2rem] pt-[2rem] sm:flex-col">
        <div className="gameBoard relative grid grid-cols-3 w-[30rem] h-[30rem] gap-2 sm:w-[20rem] sm:h-[20rem]">
          {values.map((value, index) => (
            <div
              key={index}
              className={`${xoCell(index)}shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(0,0,0,0.3)] active:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]`}
              onClick={() => handleClick(index)}
            >
              <p className={`${xoClick(value, index)} `}>
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="detailBoard flex flex-col sm:justify-center sm:items-center">
          <div className="w-[16rem]">
            <div className="flex flex-row items-center gap-4">
              <p className="custom-drop-shadow-sm text-gray-300 text-[1.5rem] ">
                PLAYER 01
              </p>
              <p className="custom-text-md ">{xoWinner(player1)}</p>
            </div>
            <div className="flex flex-row items-center gap-4">
              <span className="custom-drop-shadow-sm  text-gray-300 text-[1.5rem]">
                X{" "}
              </span>
              {!winner && isPlayer1 && (
                <span className="custom-text-sm bg-gray-300  text-[.5rem]">
                  MOVE
                </span>
              )}
            </div>
          </div>
          <div className="w-[16rem]">
            <div className="flex flex-row items-center gap-4">
              <p className="custom-drop-shadow-sm text-gray-300 text-[1.5rem] ">
                {`PLAYER ${gameMode === "PLAYER" ? "02" : "AI"}`}
              </p>
              <p className="custom-text-md ">{xoWinner(player2)}</p>
            </div>
            <div className="flex flex-row items-center gap-4">
              <span className="custom-drop-shadow-sm  text-gray-300 text-[1.5rem]">
                O{" "}
              </span>
              {!winner && !isPlayer1 && (
                <span className="custom-text-sm bg-gray-300  text-[.5rem]">
                  MOVE
                </span>
              )}
            </div>
          </div>
          <div className="all-button mb-[2rem] flex flex-col sm:justify-center sm:items-center">
            <button
              onClick={handleReset}
              className="custom-text-sm w-[10rem] bg-gray-300 text-gray-50  p-[1rem] mt-[1rem] rounded-[15px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(94,104,121,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
            >
              {winner ? "PLAY AGAIN" : "RESET"}
            </button>
            {winner && (
              <div>
                <button
                  onClick={handleReplay}
                  className="custom-text-sm w-[10rem] bg-gray-300 text-gray-50  p-[1rem] mt-[1rem] rounded-[15px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(94,104,121,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
                >
                  REPLAY
                </button>
              </div>
            )}
            {isReplaying && (
              <div className="flex flex-row gap-[.5rem]">
                <button
                  onClick={handlePrevious}
                  className="custom-text-sm bg-gray-300 text-gray-50 text-[.5rem]  p-[.5rem] mt-[1rem] rounded-[10px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(94,104,121,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
                >
                  PREVIOUS
                </button>
                <button
                  onClick={handleNext}
                  className="custom-text-sm bg-gray-300 text-gray-50 text-[.5rem]  p-[.5rem] mt-[1rem] rounded-[10px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(94,104,121,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
                >
                  NEXT
                </button>
                <button
                  onClick={handlePause}
                  className="custom-text-sm bg-gray-300 text-gray-50 text-[.5rem]  p-[.5rem] mt-[1rem] rounded-[10px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(94,104,121,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
                >
                  PAUSE
                </button>
                <button
                  onClick={handlePlay}
                  className="custom-text-sm bg-gray-300 text-gray-50 text-[.5rem]  p-[.5rem] mt-[1rem] rounded-[10px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(94,104,121,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(94,104,121,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
                >
                  PLAY
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
