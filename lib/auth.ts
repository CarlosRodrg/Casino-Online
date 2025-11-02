import { supabase } from "@/supabase/supabaseClient"

export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error("Error al registrar en Auth:", authError)
      return {
        success: false,
        message: authError.message === "User already registered" 
          ? "El email ya está registrado" 
          : "Error al crear la cuenta",
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Error al crear la cuenta",
      }
    }

    const balanceKey = `balance_${authData.user.id}`
    localStorage.setItem(balanceKey, "1000")

    const user: User = {
      id: authData.user.id,
      email: authData.user.email || email,
    }

    return {
      success: true,
      message: "Cuenta creada exitosamente",
      user,
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return {
      success: false,
      message: "Error al procesar el registro",
    }
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return {
        success: false,
        message: "Email o contraseña incorrectos",
      }
    }

    const balanceKey = `balance_${authData.user.id}`
    if (!localStorage.getItem(balanceKey)) {
      localStorage.setItem(balanceKey, "1000")
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email || email,
    }

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      user,
    }
  } catch (error) {
    console.error("Error en login:", error)
    return {
      success: false,
      message: "Error al iniciar sesión",
    }
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("Error al cerrar sesión:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return false
  }
}

export function getUserBalance(userId: string): number {
  const balanceKey = `balance_${userId}`
  const balance = localStorage.getItem(balanceKey)
  return balance ? parseFloat(balance) : 1000
}

export function updateUserBalance(userId: string, newBalance: number): boolean {
  try {
    const balanceKey = `balance_${userId}`
    localStorage.setItem(balanceKey, newBalance.toString())
    return true
  } catch (error) {
    console.error("Error al actualizar balance:", error)
    return false
  }
}

export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error al obtener sesión:", error)
    return null
  }
}
