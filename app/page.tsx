"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { GameSelector } from "@/components/game-selector"
import type { User } from "@/lib/auth"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <main className="min-h-screen">
      {!user ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <GameSelector user={user} onLogout={handleLogout} />
      )}
    </main>
  )
}
