import { apiFetch, clearStoredToken, setStoredToken } from './client'
import type { ApiUser } from '@/types/api'

interface AuthResponse {
  token: string
  user: ApiUser
}

interface RegisterResponse {
  message: string
  pending_activation: boolean
}

export async function login(payload: { login: string; password: string; remember?: boolean }): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: null,
  })

  setStoredToken(response.token)
  return response
}

export async function register(payload: {
  full_name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  role?: string
}): Promise<RegisterResponse> {
  const response = await apiFetch<RegisterResponse>('auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: null,
  })

  // Ya no se guarda token porque el usuario queda pendiente de activación
  return response
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('auth/logout', { method: 'POST' })
  } catch {
    // Ignorar errores de logout (token expirado, etc.)
    // Lo importante es limpiar el token local
  } finally {
    clearStoredToken()
  }
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const response = await apiFetch<ApiUser | { data: ApiUser } | undefined>('auth/me')

  if (!response) {
    throw new Error('Respuesta vacía al solicitar el usuario actual')
  }

  // Laravel JsonResource puede envolver en 'data' o no
  if (typeof response === 'object' && 'data' in response && response.data) {
    return response.data
  }

  return response as ApiUser
}

export async function updateUsername(username: string): Promise<ApiUser> {
  const response = await apiFetch<ApiUser | { data: ApiUser }>('auth/me/username', {
    method: 'PATCH',
    body: JSON.stringify({ username }),
  })
  // Laravel JsonResource puede envolver en 'data' o no
  if ('data' in response && response.data) {
    return response.data
  }
  return response as ApiUser
}
