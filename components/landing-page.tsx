"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Trophy, Zap, Shield, Loader2 } from "lucide-react"
import { loginUser, registerUser, type User } from "@/lib/auth"

interface LandingPageProps {
  onLogin: (user: User) => void
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const response = await loginUser(email, password)

    if (response.success && response.user) {
      onLogin(response.user)
      setShowLogin(false)
      setEmail("")
      setPassword("")
    } else {
      setError(response.message)
    }

    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const response = await registerUser(email, password)

    if (response.success && response.user) {
      onLogin(response.user)
      setShowRegister(false)
      setEmail("")
      setPassword("")
    } else {
      setError(response.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">RedLuck Casino</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowRegister(true)} variant="outline" className="border-border text-foreground hover:bg-muted cursor-pointer">
              Registrarse
            </Button>
            <Button onClick={() => setShowLogin(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              La emoción del casino <span className="text-primary">en tus manos</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Experimenta la adrenalina de las tragaperras más emocionantes. Giros ilimitados, premios increíbles y
              diversión garantizada.
            </p>
            <Button
              size="lg"
              onClick={() => setShowLogin(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 cursor-pointer"
            >
              Jugar Ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">¿Por qué elegir RedLuck?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader>
                <Trophy className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Grandes Premios</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Multiplicadores de hasta 100x en cada giro. Tus ganancias pueden ser enormes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Juego Rápido</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Giros instantáneos y resultados al momento. Sin esperas, solo diversión.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">100% Seguro</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Plataforma confiable con sistema de juego justo y transparente.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-muted-foreground">Premios Entregados</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Jugadores Activos</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">¿Listo para ganar?</h2>
          <p className="text-xl text-muted-foreground mb-8">Únete a miles de jugadores y comienza tu aventura hoy</p>
          <Button
            size="lg"
            onClick={() => setShowLogin(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 cursor-pointer"
          >
            Comenzar a Jugar
          </Button>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Iniciar Sesión</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa tus credenciales para acceder al casino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border text-foreground"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowLogin(false)
                      setError("")
                    }}
                    className="flex-1 border-border text-foreground hover:bg-muted cursor-pointer"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false)
                      setShowRegister(true)
                      setError("")
                    }}
                    className="text-primary hover:underline cursor-pointer"
                    disabled={loading}
                  >
                    Regístrate aquí
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Crear Cuenta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Regístrate para comenzar a jugar en RedLuck Casino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border text-foreground"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-foreground"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Mínimo 6 caracteres</p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrarse"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRegister(false)
                      setError("")
                    }}
                    className="flex-1 border-border text-foreground hover:bg-muted cursor-pointer"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(false)
                      setShowLogin(true)
                      setError("")
                    }}
                    className="text-primary hover:underline cursor-pointer"
                    disabled={loading}
                  >
                    Inicia sesión aquí
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
