const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'
const TOKEN_STORAGE_KEY = 'helix-service-desk-token'

export interface ApiErrorPayload {
  message: string
  errors?: Record<string, string[]>
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

interface ApiFetchOptions extends RequestInit {
  searchParams?: Record<string, string | number | boolean | undefined>
  token?: string | null
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  const token = options.token ?? getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = new URL(path.replace(/^\//, ''), API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`)

  if (options.searchParams) {
    Object.entries(options.searchParams)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => url.searchParams.append(key, String(value)))
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const payload: ApiErrorPayload | undefined = await safeJson(response)
    const message = payload?.message ?? `Error ${response.status}`
    throw new Error(message)
  }

  return safeJson(response)
}

async function safeJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    return undefined as T
  }
}
