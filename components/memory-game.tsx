"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { createBetTransaction, createWinTransaction } from "@/lib/transactions"
import type { User } from "@/lib/auth"

interface MemoryGameProps {
  balance: number
  setBalance: (balance: number) => void
  user: User
}

const cardSymbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐", "🎰"]

interface CardType {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

export function MemoryGame({ balance, setBalance, user }: MemoryGameProps) {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [betAmount] = useState(20)
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)

  const initializeGame = async () => {
    if (balance < betAmount) return

    const betResult = await createBetTransaction(user.id, "memory", betAmount)
    
    if (!betResult.success) {
      alert(betResult.message)
      return
    }

    setBalance(balance - betAmount)
    setTotalLosses(totalLosses + betAmount)

    const shuffledCards = [...cardSymbols, ...cardSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }))

    setCards(shuffledCards)
    setFlippedCards([])
    setMoves(0)
    setGameStarted(true)
    setGameWon(false)
  }

  const handleCardClick = (id: number) => {
    if (!gameStarted || gameWon || flippedCards.length === 2) return

    const card = cards.find((c) => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    setCards(cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)))

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)
      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find((c) => c.id === firstId)
      const secondCard = cards.find((c) => c.id === secondId)

      if (firstCard?.symbol === secondCard?.symbol) {
        setTimeout(() => {
          setCards(cards.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)))
          setFlippedCards([])
        }, 500)
      } else {
        setTimeout(() => {
          setCards(cards.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)))
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  useEffect(() => {
    const checkWin = async () => {
      if (gameStarted && cards.length > 0 && cards.every((c) => c.isMatched)) {
        setGameWon(true)
        const winAmount = Math.max(betAmount * 3 - moves * 5, betAmount)
        
        // Registrar ganancia en Supabase
        await createWinTransaction(user.id, "memory", winAmount)
        
        setBalance(balance + winAmount)
        setTotalWins(totalWins + winAmount)
      }
    }
    
    checkWin()
  }, [cards, gameStarted])

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Juego de Memoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary rounded-xl p-6 border-4 border-primary/30">
              {!gameStarted ? (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold text-foreground mb-4">¿Listo para jugar?</h3>
                  <p className="text-muted-foreground mb-6">
                    Encuentra todos los pares. Menos movimientos = más premio
                  </p>
                  <p className="text-lg text-primary font-bold mb-6">Costo: ${betAmount}</p>
                  <Button
                    onClick={initializeGame}
                    disabled={balance < betAmount}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-8 py-6"
                  >
                    Iniciar Juego
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {cards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        disabled={card.isFlipped || card.isMatched}
                        className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all ${
                          card.isFlipped || card.isMatched
                            ? "bg-card border-2 border-primary"
                            : "bg-primary/20 hover:bg-primary/30 border-2 border-border"
                        }`}
                      >
                        {card.isFlipped || card.isMatched ? card.symbol : "?"}
                      </button>
                    ))}
                  </div>

                  {gameWon && (
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-primary animate-bounce mb-2">
                        ¡Ganaste ${Math.max(betAmount * 3 - moves * 5, betAmount)}!
                      </div>
                      <p className="text-muted-foreground">Completado en {moves} movimientos</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Movimientos</div>
                      <div className="text-2xl font-bold text-foreground">{moves}</div>
                    </div>
                    <Button
                      onClick={initializeGame}
                      disabled={balance < betAmount}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Nuevo Juego
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-foreground">Cómo Jugar</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Encuentra todos los pares de cartas</li>
                <li>• Menos movimientos = mayor premio</li>
                <li>• Premio base: 3x la apuesta</li>
                <li>• Se descuentan $5 por cada movimiento extra</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Ganancias</span>
              </div>
              <span className="text-xl font-bold text-primary">${totalWins}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">Pérdidas</span>
              </div>
              <span className="text-xl font-bold text-muted-foreground">${totalLosses}</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance Neto</span>
                <span
                  className={`text-xl font-bold ${totalWins - totalLosses >= 0 ? "text-primary" : "text-muted-foreground"}`}
                >
                  ${totalWins - totalLosses}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
