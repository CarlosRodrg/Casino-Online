import { supabase } from "@/supabase/supabaseClient"
import { getUserBalance, updateUserBalance } from "./auth"

export interface Transaction {
  id: string
  game_type: string
  transaction_type: "bet" | "win"
  amount: number
  amount_before: number
  amount_after: number
  date: string
  user_id: string
}

export interface TransactionResponse {
  success: boolean
  message: string
  transaction?: Transaction
}

export async function createBetTransaction(
  userId: string,
  gameType: string,
  betAmount: number
): Promise<TransactionResponse> {
  try {
    const currentBalance = getUserBalance(userId)

    if (currentBalance < betAmount) {
      return {
        success: false,
        message: "Balance insuficiente",
      }
    }

    const newBalance = currentBalance - betAmount

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          game_type: gameType,
          transaction_type: "bet",
          amount: betAmount,
          amount_before: currentBalance,
          amount_after: newBalance,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear transacción de apuesta:", error)
      return {
        success: false,
        message: "Error al registrar la apuesta",
      }
    }

    updateUserBalance(userId, newBalance)

    return {
      success: true,
      message: "Apuesta registrada",
      transaction: data,
    }
  } catch (error) {
    console.error("Error en createBetTransaction:", error)
    return {
      success: false,
      message: "Error al procesar la apuesta",
    }
  }
}

export async function createWinTransaction(
  userId: string,
  gameType: string,
  winAmount: number
): Promise<TransactionResponse> {
  try {
    const currentBalance = getUserBalance(userId)
    const newBalance = currentBalance + winAmount

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          game_type: gameType,
          transaction_type: "win",
          amount: winAmount,
          amount_before: currentBalance,
          amount_after: newBalance,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear transacción de ganancia:", error)
      return {
        success: false,
        message: "Error al registrar la ganancia",
      }
    }

    updateUserBalance(userId, newBalance)

    return {
      success: true,
      message: "Ganancia registrada",
      transaction: data,
    }
  } catch (error) {
    console.error("Error en createWinTransaction:", error)
    return {
      success: false,
      message: "Error al procesar la ganancia",
    }
  }
}

export async function getUserTransactions(
  userId: string,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error al obtener transacciones:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error en getUserTransactions:", error)
    return []
  }
}

export async function getUserStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("transaction_type, amount")
      .eq("user_id", userId)

    if (error) {
      console.error("Error al obtener estadísticas:", error)
      return {
        totalBets: 0,
        totalWins: 0,
        totalBetAmount: 0,
        totalWinAmount: 0,
        netProfit: 0,
      }
    }

    const stats = data.reduce(
      (acc, transaction) => {
        if (transaction.transaction_type === "bet") {
          acc.totalBets++
          acc.totalBetAmount += transaction.amount
        } else if (transaction.transaction_type === "win") {
          acc.totalWins++
          acc.totalWinAmount += transaction.amount
        }
        return acc
      },
      {
        totalBets: 0,
        totalWins: 0,
        totalBetAmount: 0,
        totalWinAmount: 0,
        netProfit: 0,
      }
    )

    stats.netProfit = stats.totalWinAmount - stats.totalBetAmount

    return stats
  } catch (error) {
    console.error("Error en getUserStats:", error)
    return {
      totalBets: 0,
      totalWins: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      netProfit: 0,
    }
  }
}
