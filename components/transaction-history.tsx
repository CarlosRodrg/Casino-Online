"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"
import { getUserTransactions, getUserStats, type Transaction } from "@/lib/transactions"
import { getUserBalance } from "@/lib/auth"
import type { User } from "@/lib/auth"

interface TransactionHistoryProps {
  user: User
}

export function TransactionHistory({ user }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalBetAmount: 0,
    totalWinAmount: 0,
    netProfit: 0,
  })
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "bet" | "win">("all")

  useEffect(() => {
    loadData()
  }, [user.id])

  const loadData = async () => {
    setLoading(true)
    
    // Cargar transacciones
    const transactionsData = await getUserTransactions(user.id, 100)
    setTransactions(transactionsData)
    
    // Cargar estadísticas
    const statsData = await getUserStats(user.id)
    setStats(statsData)
    
    // Cargar balance actual
    const currentBalance = getUserBalance(user.id)
    setBalance(currentBalance)
    
    setLoading(false)
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true
    return t.transaction_type === filter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getGameName = (gameType: string) => {
    const games: { [key: string]: string } = {
      slots: "Tragaperras",
      memory: "Memoria",
      poker: "Poker",
    }
    return games[gameType] || gameType
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Historial de Transacciones</h1>
        <p className="text-muted-foreground">Revisa todas tus apuestas y ganancias</p>
      </div>

      {/* Balance y Estadísticas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Balance Actual */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance Actual</p>
                <p className="text-2xl font-bold text-primary">${balance}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Total Apostado */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Apostado</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalBetAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{stats.totalBets} apuestas</p>
              </div>
              <TrendingDown className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Total Ganado */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Ganado</p>
                <p className="text-2xl font-bold text-primary">${stats.totalWinAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{stats.totalWins} ganancias</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Balance Neto */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance Neto</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.netProfit >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {stats.netProfit >= 0 ? "+" : ""}${stats.netProfit.toFixed(2)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-foreground">Filtrar Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "default" : "outline"}
              className={
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              Todas ({transactions.length})
            </Button>
            <Button
              onClick={() => setFilter("bet")}
              variant={filter === "bet" ? "default" : "outline"}
              className={
                filter === "bet"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              Apuestas ({transactions.filter((t) => t.transaction_type === "bet").length})
            </Button>
            <Button
              onClick={() => setFilter("win")}
              variant={filter === "win" ? "default" : "outline"}
              className={
                filter === "win"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              Ganancias ({transactions.filter((t) => t.transaction_type === "win").length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Transacciones */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Historial ({filteredTransactions.length} transacciones)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando transacciones...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay transacciones para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Juego
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Tipo
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Monto
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Balance Antes
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Balance Después
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm text-foreground">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {getGameName(transaction.game_type)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.transaction_type === "win"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {transaction.transaction_type === "win" ? "Ganancia" : "Apuesta"}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-semibold ${
                          transaction.transaction_type === "win" ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {transaction.transaction_type === "win" ? "+" : "-"}$
                        {transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                        ${transaction.amount_before.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                        ${transaction.amount_after.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
