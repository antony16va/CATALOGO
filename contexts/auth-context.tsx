"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { fetchCurrentUser, logout as apiLogout } from "@/lib/api/auth"
import { getStoredToken, clearStoredToken } from "@/lib/api/client"
import type { ApiUser } from "@/types/api"

/**
 * Tipo del usuario autenticado con propiedades de conveniencia.
 */
export interface AuthUser {
  id: number
  username: string
  fullName: string
  email: string
  role: "Administrador" | "Usuario"
  isAdmin: boolean
  active: boolean
}

/**
 * Tipo del contexto de autenticación.
 */
interface AuthContextType {
  /** Usuario autenticado actual (null si no hay sesión) */
  user: AuthUser | null
  /** Indica si se está cargando la información del usuario */
  isLoading: boolean
  /** Indica si el usuario es administrador */
  isAdmin: boolean
  /** Indica si hay un usuario autenticado */
  isAuthenticated: boolean
  /** Recarga la información del usuario desde la API */
  refreshUser: () => Promise<void>
  /** Cierra la sesión del usuario */
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Convierte el usuario de la API al formato del contexto.
 */
function mapApiUserToAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    username: apiUser.username,
    fullName: apiUser.full_name,
    email: apiUser.email,
    role: apiUser.role,
    isAdmin: apiUser.role === "Administrador",
    active: apiUser.active,
  }
}

/**
 * Props del proveedor de autenticación.
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Proveedor de contexto de autenticación.
 * Envuelve la aplicación para proporcionar acceso al usuario actual.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Carga el usuario actual desde la API si hay un token almacenado.
   */
  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const apiUser = await fetchCurrentUser()
      setUser(mapApiUserToAuthUser(apiUser))
    } catch (error) {
      // Token inválido o expirado
      console.error("Error al obtener usuario:", error)
      clearStoredToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Cierra la sesión del usuario.
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
    }
  }, [])

  // Cargar usuario al montar el componente
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const value: AuthContextType = {
    user,
    isLoading,
    isAdmin: user?.isAdmin ?? false,
    isAuthenticated: user !== null,
    refreshUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para acceder al contexto de autenticación.
 * Debe usarse dentro de un AuthProvider.
 * 
 * @example
 * ```tsx
 * const { user, isAdmin } = useAuth()
 * if (isAdmin) {
 *   // Mostrar opciones de administrador
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}
