import { useState, useEffect } from "react";

function App() {
  const player1 = "X";
  const player2 = "O";

  const [isPlayer1, setIsPlayer1] = useState<boolean>(true);
  const [values, setValues] = useState<(string | null)[]>(Array(9).fill(null));
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<(string | null)[]>>([
    Array(9).fill(null),
  ]);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<"PLAYER" | "BOT">("PLAYER");

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

  useEffect(() => {
    if (!isPlayer1 && !winner && gameMode === "BOT") {
      const aiMove = findBestMove(values);
      handleClick(aiMove);
    }
  }, [isPlayer1, winner, values, gameMode]);

  const handleClick = (index: number) => {
    if (winner || values[index] || isReplaying) return;

    const newValues = values.slice();
    newValues[index] = isPlayer1 ? player1 : player2;
    setValues(newValues);
    setHistory([...history, newValues]);
    setIsPlayer1(!isPlayer1);

    checkWinner(newValues);
  };

  const checkWinner = (values: (string | null)[]) => {
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
        setWinner(line[0]);
        return;
      }
    }

    if (values.every((value) => value !== null)) {
      setWinner("DRAW");
    }
  };

  const handleReset = () => {
    setValues(Array(9).fill(null));
    setWinner(null);
    setIsPlayer1(true);
    setHistory([Array(9).fill(null)]);
    setIsReplaying(false);
    setReplayIndex(0);
    setIsPlaying(false);
  };

  const handleReplay = () => {
    setIsReplaying(true);
    setReplayIndex(0);
    setIsPlaying(true);
  };

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

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };
  const handleGameModeChange = (mode: "PLAYER" | "BOT") => {
    setGameMode(mode);
    handleReset(); // Reset the game when changing mode
  };

  const xoCell = ` bg-gray-300  cursor-pointer flex flex-row justify-center items-center  rounded-[20px]
`;
  const xoClick = (value: string | null) =>
    `absolute text-[5rem] ${
      value === player1 ? "text-gray-300 " : "text-gray-300"
    }`;

  const xoWinner = (player: string) => {
    if (winner === "DRAW") {
      return <span className="">DRAW</span>;
    }
    if (winner === player) {
      return <span className="">WIN</span>;
    }
    if (winner && winner !== player) {
      return <span className="">LOSE</span>;
    }
    return null;
  };

  // Minimax Algorithm
  const minimax = (
    newValues: (string | null)[],
    depth: number,
    isMaximizing: boolean
  ): number => {
    const scores: { [key: string]: number } = {
      X: -1,
      O: 1,
      DRAW: 0,
    };

    const result = getWinner(newValues);
    if (result !== null) {
      return scores[result];
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < newValues.length; i++) {
        if (newValues[i] === null) {
          newValues[i] = player2;
          let score = minimax(newValues, depth + 1, false);
          newValues[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < newValues.length; i++) {
        if (newValues[i] === null) {
          newValues[i] = player1;
          let score = minimax(newValues, depth + 1, true);
          newValues[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

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

  return (
    <main className="min-h-screen w-screen bg-gray-300 text-gray-50 flex flex-col  items-center">
      <h1 className="custom-text-lg" >XO</h1>
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
              Play against another player
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
              Play against AI
              
            </label>
          </div>
      <div className="flex flex-row justify-center items-center gap-[2rem] pt-[2rem] ">
        <div className="gameBoard relative grid grid-cols-3 w-[30rem] h-[30rem] gap-2 ">
          {values.map((value, index) => (
            <div
              key={index}
              className={`${xoCell} shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(0,0,0,0.3)] active:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]`}
              onClick={() => handleClick(index)}
            >
              <p className={`custom-drop-shadow ${xoClick(value)} font-bold `}>{value}</p>
            </div>
          ))}
        </div>
        <div className="detailBoard">
          <div className="w-[16rem]">
            <div className="flex flex-row items-center gap-4">
            <p className="custom-drop-shadow-sm text-gray-300 text-[1.5rem] ">
              PLAYER 01 
            </p>
            <p className="custom-text-md ">{xoWinner(player1)}</p>
            </div>
            <div className="flex flex-row items-center gap-4">
            <span className="custom-drop-shadow-sm  text-gray-300 text-[1.5rem]">X </span>
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
            <span className="custom-drop-shadow-sm  text-gray-300 text-[1.5rem]">O </span>
            {!winner && !isPlayer1 && (
                <span className="custom-text-sm bg-gray-300  text-[.5rem]">
                  MOVE
                </span>
              )}
              </div>
          </div>
          <button
            onClick={handleReset}
            className="custom-text-sm w-[10rem] bg-gray-300 text-gray-50  p-[1rem] mt-[1rem] rounded-[15px] shadow-[-5px_-5px_9px_rgba(255,255,255,0.45),5px_5px_9px_rgba(0,0,0,0.3)] active:shadow-[inset_-5px_-5px_9px_rgba(255,255,255,0.45),inset_5px_5px_9px_rgba(0,0,0,0.3)] hover:shadow-none hover:outline hover:outline-gray-200 hover:outline-[1px]"
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
    </main>
  );
}

export default App;
