"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react"
import { createBetTransaction, createWinTransaction } from "@/lib/transactions"
import type { User } from "@/lib/auth"

interface SlotMachineProps {
  balance: number
  setBalance: (balance: number) => void
  user: User
}

const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐"]

export function SlotMachine({ balance, setBalance, user }: SlotMachineProps) {
  const [bet, setBet] = useState(10)
  const [reels, setReels] = useState(["🍒", "🍋", "🍊"])
  const [spinning, setSpinning] = useState(false)
  const [lastWin, setLastWin] = useState(0)
  const [totalWins, setTotalWins] = useState(0)
  const [totalLosses, setTotalLosses] = useState(0)

  const spin = async () => {
    if (spinning || balance < bet) return

    setSpinning(true)
    
    // Registrar apuesta en Supabase
    const betResult = await createBetTransaction(user.id, "slots", bet)
    
    if (!betResult.success) {
      setSpinning(false)
      alert(betResult.message)
      return
    }
    
    // Actualizar balance local
    setBalance(balance - bet)
    setTotalLosses(totalLosses + bet)

    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ])
    }, 100)

    setTimeout(async () => {
      clearInterval(spinInterval)

      const finalReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]

      setReels(finalReels)

      let winAmount = 0
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        if (finalReels[0] === "💎") {
          winAmount = bet * 100
        } else if (finalReels[0] === "7️⃣") {
          winAmount = bet * 50
        } else if (finalReels[0] === "⭐") {
          winAmount = bet * 25
        } else {
          winAmount = bet * 10
        }
      } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
        winAmount = bet * 2
      }

      if (winAmount > 0) {
        // Registrar ganancia en Supabase
        await createWinTransaction(user.id, "slots", winAmount)
        
        setBalance(balance - bet + winAmount)
        setLastWin(winAmount)
        setTotalWins(totalWins + winAmount)
      } else {
        setLastWin(0)
      }

      setSpinning(false)
    }, 2000)
  }

  const increaseBet = () => {
    if (bet < balance && bet < 100) {
      setBet(bet + 10)
    }
  }

  const decreaseBet = () => {
    if (bet > 10) {
      setBet(bet - 10)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">RedLuck Casino</h1>
            <div className="hidden md:flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
              <span className="text-muted-foreground">Balance:</span>
              <span className="text-2xl font-bold text-primary">${balance}</span>
            </div>
          </div>
          <Button
            onClick={() => {}}
            variant="outline"
            className="border-border text-foreground hover:bg-muted bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Slot Machine */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-center text-foreground">Tragaperras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reels */}
                <div className="bg-secondary rounded-xl p-8 border-4 border-primary/30">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {reels.map((symbol, index) => (
                      <div
                        key={index}
                        className={`bg-card rounded-lg h-32 flex items-center justify-center text-6xl border-2 border-border ${
                          spinning ? "animate-pulse" : ""
                        }`}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>

                  {/* Last Win */}
                  {lastWin > 0 && (
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-primary animate-bounce">¡Ganaste ${lastWin}!</div>
                    </div>
                  )}

                  {/* Bet Controls */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button
                      onClick={decreaseBet}
                      disabled={spinning || bet <= 10}
                      variant="outline"
                      size="icon"
                      className="border-border text-foreground hover:bg-muted bg-transparent"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Apuesta</div>
                      <div className="text-2xl font-bold text-foreground">${bet}</div>
                    </div>
                    <Button
                      onClick={increaseBet}
                      disabled={spinning || bet >= 100 || bet >= balance}
                      variant="outline"
                      size="icon"
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Spin Button */}
                  <Button
                    onClick={spin}
                    disabled={spinning || balance < bet}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6"
                  >
                    {spinning ? "Girando..." : "GIRAR"}
                  </Button>
                </div>

                {/* Paytable */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-bold mb-2 text-foreground">Tabla de Pagos</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">💎 💎 💎</div>
                    <div className="text-right text-foreground">100x</div>
                    <div className="text-muted-foreground">7️⃣ 7️⃣ 7️⃣</div>
                    <div className="text-right text-foreground">50x</div>
                    <div className="text-muted-foreground">⭐ ⭐ ⭐</div>
                    <div className="text-right text-foreground">25x</div>
                    <div className="text-muted-foreground">Cualquier 3</div>
                    <div className="text-right text-foreground">10x</div>
                    <div className="text-muted-foreground">Cualquier 2</div>
                    <div className="text-right text-foreground">2x</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Balance Card - Mobile */}
            <Card className="md:hidden bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">Balance</div>
                  <div className="text-3xl font-bold text-primary">${balance}</div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
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

            {/* Info Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Información</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Las estadísticas mostradas son de la sesión actual. Para ver tu historial completo de transacciones, ve a la sección <span className="text-primary font-semibold">Historial</span>.
                  </p>
                  <p>
                    Todas tus apuestas y ganancias se registran automáticamente en la base de datos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
