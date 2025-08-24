"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, User, Bot, Trophy } from "lucide-react"

type Player = "X" | "O" | null
type Board = Player[]
type GameStatus = "playing" | "won" | "draw"
type Difficulty = "easy" | "medium" | "hard"

interface GameState {
  board: Board
  currentPlayer: Player
  status: GameStatus
  winner: Player
  scores: { human: number; ai: number; draws: number }
}

export default function TicTacToeAI() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    status: "playing",
    winner: null,
    scores: { human: 0, ai: 0, draws: 0 },
  })

  const checkWinner = (board: Board): Player => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (const [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const isBoardFull = (board: Board): boolean => board.every(cell => cell !== null)

  const minimax = (board: Board, depth: number, isMax: boolean, alpha = -Infinity, beta = Infinity): number => {
    const winner = checkWinner(board)
    if (winner === "O") return 10 - depth
    if (winner === "X") return depth - 10
    if (isBoardFull(board)) return 0

    if (isMax) {
      let maxEval = -Infinity
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "O"
          const evalVal = minimax(board, depth + 1, false, alpha, beta)
          board[i] = null
          maxEval = Math.max(maxEval, evalVal)
          alpha = Math.max(alpha, evalVal)
          if (beta <= alpha) break
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "X"
          const evalVal = minimax(board, depth + 1, true, alpha, beta)
          board[i] = null
          minEval = Math.min(minEval, evalVal)
          beta = Math.min(beta, evalVal)
          if (beta <= alpha) break
        }
      }
      return minEval
    }
  }

  const getRandomMove = (board: Board): number => {
    const available = board.map((v, i) => (v === null ? i : null)).filter(v => v !== null) as number[]
    return available[Math.floor(Math.random() * available.length)]
  }

  const getBestMove = (board: Board, level: Difficulty): number => {
    if (level === "easy") return getRandomMove(board)
    if (level === "medium") return Math.random() < 0.5 ? getRandomMove(board) : hardMove(board)
    return hardMove(board) // hard
  }

  const hardMove = (board: Board): number => {
    let bestMove = -1
    let bestVal = -Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O"
        const moveVal = minimax(board, 0, false)
        board[i] = null
        if (moveVal > bestVal) {
          bestVal = moveVal
          bestMove = i
        }
      }
    }
    return bestMove
  }

  const handleCellClick = (i: number) => {
    if (!difficulty) return
    if (gameState.board[i] || gameState.status !== "playing" || gameState.currentPlayer !== "X") return

    const boardCopy = [...gameState.board]
    boardCopy[i] = "X"
    const winner = checkWinner(boardCopy)

    if (winner) {
      setGameState(prev => ({
        ...prev,
        board: boardCopy,
        status: "won",
        winner,
        scores: { ...prev.scores, human: prev.scores.human + 1 },
      }))
    } else if (isBoardFull(boardCopy)) {
      setGameState(prev => ({
        ...prev,
        board: boardCopy,
        status: "draw",
        scores: { ...prev.scores, draws: prev.scores.draws + 1 },
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        board: boardCopy,
        currentPlayer: "O",
      }))
    }
  }

  useEffect(() => {
    if (!difficulty) return
    if (gameState.currentPlayer === "O" && gameState.status === "playing") {
      const timeout = setTimeout(() => {
        const move = getBestMove(gameState.board, difficulty)
        const boardCopy = [...gameState.board]
        boardCopy[move] = "O"
        const winner = checkWinner(boardCopy)

        if (winner) {
          setGameState(prev => ({
            ...prev,
            board: boardCopy,
            status: "won",
            winner,
            scores: { ...prev.scores, ai: prev.scores.ai + 1 },
          }))
        } else if (isBoardFull(boardCopy)) {
          setGameState(prev => ({
            ...prev,
            board: boardCopy,
            status: "draw",
            scores: { ...prev.scores, draws: prev.scores.draws + 1 },
          }))
        } else {
          setGameState(prev => ({
            ...prev,
            board: boardCopy,
            currentPlayer: "X",
          }))
        }
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [gameState.currentPlayer, gameState.status, difficulty])

  const resetGame = () =>
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
    }))

  const resetScores = () =>
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "X",
      status: "playing",
      winner: null,
      scores: { human: 0, ai: 0, draws: 0 },
    }))

  const goBackToDifficulty = () => {
    setDifficulty(null)
    resetScores()
  }

  const getStatusMessage = () => {
    if (!difficulty) return "Choose Difficulty to Start"
    if (gameState.status === "won") return gameState.winner === "X" ? "You Win! 🎉" : "AI Wins! 🤖"
    if (gameState.status === "draw") return "It's a Draw! 🤝"
    return gameState.currentPlayer === "X" ? "Your Turn" : "AI Thinking..."
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Tic-Tac-Toe AI🤖</h1>
          <p className="text-slate-600">Choose difficulty and challenge the AI</p>
        </div>

        {!difficulty ? (
          <div className="flex justify-center gap-4">
            <Button onClick={() => setDifficulty("easy")}>Easy</Button>
            <Button onClick={() => setDifficulty("medium")}>Medium</Button>
            <Button onClick={() => setDifficulty("hard")}>Hard</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {getStatusMessage()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {gameState.board.map((cell, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 text-2xl font-bold hover:bg-slate-50 transition-all duration-200 border-2 bg-transparent"
                      onClick={() => handleCellClick(index)}
                      disabled={cell !== null || gameState.status !== "playing" || gameState.currentPlayer !== "X"}
                    >
                      {cell && <span className={cell === "X" ? "text-blue-600" : "text-red-600"}>{cell}</span>}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetGame} variant="outline" className="flex-1 bg-transparent">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>
                  <Button onClick={resetScores} variant="outline" className="flex-1 bg-transparent">
                    Reset Scores
                  </Button>
                </div>

                <div className="mt-4">
                  <Button onClick={goBackToDifficulty} variant="destructive" className="w-full">
                    Change Difficulty
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Score Board</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">You (X)</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {gameState.scores.human}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-red-600" />
                    <span className="font-medium">AI (O)</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {gameState.scores.ai}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium">Draws</span>
                  <Badge variant="secondary">{gameState.scores.draws}</Badge>
                </div>

                <Separator />

                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-slate-700">Algorithm Info</h3>
                  <p className="text-sm text-slate-600">Challenge the unbeatable AI powered by Minimax Algorithm</p>
                  <p className="text-xs text-slate-500">AI Adapts To Chosen Difficulty</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
