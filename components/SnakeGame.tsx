"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Simple grid-based Snake, canvas-rendered, styled to match the vault's
// purple/dark palette. No external deps — pure canvas + keyboard input.
const GRID_SIZE = 20; // 20x20 cells
const CELL_PX = 18; // rendered cell size
const BOARD_PX = GRID_SIZE * CELL_PX;
const INITIAL_SPEED_MS = 130;
const MIN_SPEED_MS = 70;

type Point = { x: number; y: number };

function randomEmptyCell(snake: Point[]): Point {
  while (true) {
    const cell = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some((s) => s.x === cell.x && s.y === cell.y)) return cell;
  }
}

function readHighScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem("sero-snake-highscore");
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 14, y: 10 });
  const loopRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");

  useEffect(() => {
    setHighScore(readHighScore());
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#150f22";
    ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

    // subtle grid
    ctx.strokeStyle = "rgba(43, 33, 64, 0.6)";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_PX, 0);
      ctx.lineTo(i * CELL_PX, BOARD_PX);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_PX);
      ctx.lineTo(BOARD_PX, i * CELL_PX);
      ctx.stroke();
    }

    // food
    const food = foodRef.current;
    ctx.fillStyle = "#d8b4fe";
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_PX + CELL_PX / 2,
      food.y * CELL_PX + CELL_PX / 2,
      CELL_PX / 2.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#a855f7" : "#8b2fe0";
      const pad = i === 0 ? 1 : 1.5;
      ctx.fillRect(
        seg.x * CELL_PX + pad,
        seg.y * CELL_PX + pad,
        CELL_PX - pad * 2,
        CELL_PX - pad * 2
      );
    });
  }, []);

  const endGame = useCallback(() => {
    setStatus("over");
    if (loopRef.current) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
    setScore((s) => {
      const hs = readHighScore();
      if (s > hs) {
        window.localStorage.setItem("sero-snake-highscore", String(s));
        setHighScore(s);
      }
      return s;
    });
  }, []);

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = snake[0];
    const newHead: Point = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y >= GRID_SIZE ||
      snake.some((s) => s.x === newHead.x && s.y === newHead.y)
    ) {
      endGame();
      return;
    }

    const newSnake = [newHead, ...snake];

    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      setScore((s) => s + 1);
      foodRef.current = randomEmptyCell(newSnake);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  }, [draw, endGame]);

  const startLoop = useCallback(
    (speed: number) => {
      if (loopRef.current) window.clearInterval(loopRef.current);
      loopRef.current = window.setInterval(tick, speed);
    },
    [tick]
  );

  const startGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randomEmptyCell(snakeRef.current);
    setScore(0);
    setStatus("playing");
    draw();
    startLoop(INITIAL_SPEED_MS);
  }, [draw, startLoop]);

  // Speed up gradually as the score climbs.
  useEffect(() => {
    if (status !== "playing") return;
    const speed = Math.max(MIN_SPEED_MS, INITIAL_SPEED_MS - score * 4);
    startLoop(speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, status]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const dir = dirRef.current;
      const key = e.key.toLowerCase();

      if (status !== "playing") {
        if (key === "enter" || key === " ") {
          e.preventDefault();
          startGame();
        }
        return;
      }

      let next: Point | null = null;
      if ((key === "arrowup" || key === "w") && dir.y === 0) next = { x: 0, y: -1 };
      else if ((key === "arrowdown" || key === "s") && dir.y === 0) next = { x: 0, y: 1 };
      else if ((key === "arrowleft" || key === "a") && dir.x === 0) next = { x: -1, y: 0 };
      else if ((key === "arrowright" || key === "d") && dir.x === 0) next = { x: 1, y: 0 };

      if (next) {
        e.preventDefault();
        nextDirRef.current = next;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, startGame]);

  useEffect(() => {
    return () => {
      if (loopRef.current) window.clearInterval(loopRef.current);
    };
  }, []);

  function setDirButton(x: number, y: number) {
    const dir = dirRef.current;
    if (x !== 0 && dir.x === 0) nextDirRef.current = { x, y: 0 };
    if (y !== 0 && dir.y === 0) nextDirRef.current = { x: 0, y };
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-sm text-vault-muted">
        <span>
          Score: <span className="text-vault-accentbright font-display">{score}</span>
        </span>
        <span>
          Best: <span className="text-vault-accentbright font-display">{highScore}</span>
        </span>
      </div>

      <div className="vault-panel relative overflow-hidden p-2">
        <canvas
          ref={canvasRef}
          width={BOARD_PX}
          height={BOARD_PX}
          className="block rounded-lg"
          style={{ imageRendering: "pixelated" }}
        />

        {status !== "playing" && (
          <div
            className="absolute inset-2 flex flex-col items-center justify-center gap-4 rounded-lg bg-vault-bg/85 text-center backdrop-blur-sm cursor-pointer"
            onClick={startGame}
          >
            <p className="font-display text-2xl">
              {status === "idle" ? "Snake" : "Game Over"}
            </p>
            {status === "over" && (
              <p className="text-sm text-vault-muted">
                You scored <span className="text-vault-accentbright">{score}</span>
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="vault-btn"
            >
              {status === "idle" ? "Play" : "Play Again"}
            </button>
            <p className="text-xs text-vault-muted">Arrow keys or WASD &middot; Enter to start</p>
          </div>
        )}
      </div>

      {/* Touch controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <span />
        <button
          aria-label="Up"
          onClick={() => setDirButton(0, -1)}
          className="vault-btn-ghost px-4 py-2"
        >
          &uarr;
        </button>
        <span />
        <button
          aria-label="Left"
          onClick={() => setDirButton(-1, 0)}
          className="vault-btn-ghost px-4 py-2"
        >
          &larr;
        </button>
        <button
          aria-label="Down"
          onClick={() => setDirButton(0, 1)}
          className="vault-btn-ghost px-4 py-2"
        >
          &darr;
        </button>
        <button
          aria-label="Right"
          onClick={() => setDirButton(1, 0)}
          className="vault-btn-ghost px-4 py-2"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
