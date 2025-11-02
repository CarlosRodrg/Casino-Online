"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { createBetTransaction, createWinTransaction } from "@/lib/transactions"
import type { User } from "@/lib/auth"

interface PokerGameProps {
  balance: number
  setBalance: (balance: number) => void
  user: User
}

const suits = ["♠", "♥", "♦", "♣"]
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

interface CardType {
  suit: string
  value: string
  held: boolean
}

export function PokerGame({ balance, setBalance, user }: PokerGameProps) {
  const [hand, setHand] = useState<CardType[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [betAmount] = useState(25)
  const [lastWin, setLastWin] = useState(0)
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)
  const [result, setResult] = useState("")

  const createDeck = (): CardType[] => {
    const deck: CardType[] = []
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value, held: false })
      }
    }
    return deck.sort(() => Math.random() - 0.5)
  }

  const dealHand = async () => {
    if (balance < betAmount) return

    // Registrar apuesta en Supabase
    const betResult = await createBetTransaction(user.id, "poker", betAmount)
    
    if (!betResult.success) {
      alert(betResult.message)
      return
    }

    setBalance(balance - betAmount)
    setTotalLosses(totalLosses + betAmount)

    const deck = createDeck()
    setHand(deck.slice(0, 5))
    setGameStarted(true)
    setHasDrawn(false)
    setLastWin(0)
    setResult("")
  }

  const toggleHold = (index: number) => {
    if (hasDrawn) return
    setHand(hand.map((card, i) => (i === index ? { ...card, held: !card.held } : card)))
  }

  const evaluateHand = (cards: CardType[]): { name: string; multiplier: number } => {
    const valueCounts: { [key: string]: number } = {}
    const suitCounts: { [key: string]: number } = {}

    cards.forEach((card) => {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1
    })

    const counts = Object.values(valueCounts).sort((a, b) => b - a)
    const isFlush = Object.values(suitCounts).some((count) => count === 5)

    const valueOrder = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    const sortedValues = cards.map((c) => valueOrder.indexOf(c.value)).sort((a, b) => a - b)
    const isStraight =
      sortedValues.every((val, i) => i === 0 || val === sortedValues[i - 1] + 1) ||
      (sortedValues[0] === 0 && sortedValues[4] === 12 && sortedValues[1] === 9)

    if (isFlush && isStraight) return { name: "Escalera de Color", multiplier: 50 }
    if (counts[0] === 4) return { name: "Poker", multiplier: 25 }
    if (counts[0] === 3 && counts[1] === 2) return { name: "Full House", multiplier: 9 }
    if (isFlush) return { name: "Color", multiplier: 6 }
    if (isStraight) return { name: "Escalera", multiplier: 4 }
    if (counts[0] === 3) return { name: "Trío", multiplier: 3 }
    if (counts[0] === 2 && counts[1] === 2) return { name: "Doble Pareja", multiplier: 2 }
    if (counts[0] === 2) {
      const pairValue = Object.keys(valueCounts).find((k) => valueCounts[k] === 2)
      if (pairValue && ["J", "Q", "K", "A"].includes(pairValue)) {
        return { name: "Pareja Alta", multiplier: 1 }
      }
    }

    return { name: "Nada", multiplier: 0 }
  }

  const draw = async () => {
    if (!gameStarted || hasDrawn) return

    const deck = createDeck()
    let deckIndex = 0

    const newHand = hand.map((card) => {
      if (card.held) return card
      while (deckIndex < deck.length) {
        const newCard = deck[deckIndex++]
        if (!hand.some((c) => c.suit === newCard.suit && c.value === newCard.value)) {
          return { ...newCard, held: false }
        }
      }
      return card
    })

    setHand(newHand)
    setHasDrawn(true)

    const evaluation = evaluateHand(newHand)
    setResult(evaluation.name)

    if (evaluation.multiplier > 0) {
      const winAmount = betAmount * evaluation.multiplier
      
      // Registrar ganancia en Supabase
      await createWinTransaction(user.id, "poker", winAmount)
      
      setLastWin(winAmount)
      setBalance(balance + winAmount)
      setTotalWins(totalWins + winAmount)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Video Poker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary rounded-xl p-6 border-4 border-primary/30">
              {!gameStarted ? (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold text-foreground mb-4">¿Listo para jugar?</h3>
                  <p className="text-muted-foreground mb-6">Consigue la mejor mano de poker posible</p>
                  <p className="text-lg text-primary font-bold mb-6">Apuesta: ${betAmount}</p>
                  <Button
                    onClick={dealHand}
                    disabled={balance < betAmount}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-8 py-6"
                  >
                    Repartir Cartas
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {hand.map((card, index) => (
                      <button
                        key={index}
                        onClick={() => toggleHold(index)}
                        className={`aspect-[2/3] rounded-lg flex flex-col items-center justify-center transition-all ${
                          card.suit === "♥" || card.suit === "♦"
                            ? "bg-card text-primary border-2"
                            : "bg-card text-foreground border-2"
                        } ${card.held ? "border-primary ring-2 ring-primary" : "border-border"}`}
                      >
                        <div className="text-3xl font-bold">{card.value}</div>
                        <div className="text-4xl">{card.suit}</div>
                        {card.held && !hasDrawn && <div className="text-xs text-primary font-bold mt-1">HOLD</div>}
                      </button>
                    ))}
                  </div>

                  {result && (
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-foreground mb-1">{result}</div>
                      {lastWin > 0 && (
                        <div className="text-3xl font-bold text-primary animate-bounce">¡Ganaste ${lastWin}!</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!hasDrawn ? (
                      <Button
                        onClick={draw}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6"
                      >
                        Cambiar Cartas
                      </Button>
                    ) : (
                      <Button
                        onClick={dealHand}
                        disabled={balance < betAmount}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6"
                      >
                        Nueva Mano
                      </Button>
                    )}
                  </div>

                  {!hasDrawn && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Haz clic en las cartas que quieres mantener
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-foreground">Tabla de Pagos</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Escalera de Color</div>
                <div className="text-right text-foreground">50x</div>
                <div className="text-muted-foreground">Poker</div>
                <div className="text-right text-foreground">25x</div>
                <div className="text-muted-foreground">Full House</div>
                <div className="text-right text-foreground">9x</div>
                <div className="text-muted-foreground">Color</div>
                <div className="text-right text-foreground">6x</div>
                <div className="text-muted-foreground">Escalera</div>
                <div className="text-right text-foreground">4x</div>
                <div className="text-muted-foreground">Trío</div>
                <div className="text-right text-foreground">3x</div>
                <div className="text-muted-foreground">Doble Pareja</div>
                <div className="text-right text-foreground">2x</div>
                <div className="text-muted-foreground">Pareja Alta (J+)</div>
                <div className="text-right text-foreground">1x</div>
              </div>
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
