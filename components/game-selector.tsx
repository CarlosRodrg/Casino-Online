"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {  Gamepad2, History } from "lucide-react"
import { SlotMachine } from "@/components/slot-machine"
import { MemoryGame } from "@/components/memory-game"
import { PokerGame } from "@/components/poker-game"
import { TransactionHistory } from "@/components/transaction-history"
import { getUserBalance, updateUserBalance, type User } from "@/lib/auth"

interface GameSelectorProps {
  user: User
  onLogout: () => void
}

type GameType = "slots" | "memory" | "poker" | "history"

export function GameSelector({ user, onLogout }: GameSelectorProps) {
  const [currentGame, setCurrentGame] = useState<GameType>("slots")
  const [balance, setBalance] = useState(() => getUserBalance(user.id))

  // Sincronizar balance con localStorage cuando cambie
  useEffect(() => {
    updateUserBalance(user.id, balance)
  }, [balance, user.id])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">RedLuck Casino</h1>
            <div className="hidden md:flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
              <span className="text-muted-foreground">Balance:</span>
              <span className="text-2xl font-bold text-primary">${balance}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        <Button onClick={onLogout} variant="outline">
          <Arrowleft />
          Salir
        </Button>
      </header>

      {/* Game Navigation */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            <Button
              onClick={() => setCurrentGame("slots")}
              variant={currentGame === "slots" ? "default" : "outline"}
              className={
                currentGame === "slots"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Tragaperras
            </Button>
            <Button
              onClick={() => setCurrentGame("memory")}
              variant={currentGame === "memory" ? "default" : "outline"}
              className={
                currentGame === "memory"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Memoria
            </Button>
            <Button
              onClick={() => setCurrentGame("poker")}
              variant={currentGame === "poker" ? "default" : "outline"}
              className={
                currentGame === "poker"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Poker
            </Button>
            <Button
              onClick={() => setCurrentGame("history")}
              variant={currentGame === "history" ? "default" : "outline"}
              className={
                currentGame === "history"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              <History className="w-4 h-4 mr-2" />
              Historial
            </Button>
          </div>
        </div>
      </div>

      {/* Game Content */}
      {currentGame === "history" ? (
        <TransactionHistory user={user} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {currentGame === "slots" && <SlotMachine balance={balance} setBalance={setBalance} user={user} />}
          {currentGame === "memory" && <MemoryGame balance={balance} setBalance={setBalance} user={user} />}
          {currentGame === "poker" && <PokerGame balance={balance} setBalance={setBalance} user={user} />}
        </div>
      )}
    </div>
  )
}
