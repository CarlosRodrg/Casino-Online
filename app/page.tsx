"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { GameSelector } from "@/components/game-selector"
import type { User } from "@/lib/auth"

export default function Home() {
  // Estado del usuario actualmente autenticado
  const [user, setUser] = useState<User | null>(null)

  // Función para manejar login exitoso
  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  // Función para manejar logout
  const handleLogout = () => {
    setUser(null)
  }

  return (
    <main className="min-h-screen">
      {!user ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        // Si hay usuario, mostramos el selector de juegos
        <GameSelector user={user} onLogout={handleLogout} />
      )}
    </main>
  )
}
