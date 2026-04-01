import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface AuthUser {
  id: number
  name: string
  email: string
  role: "customer" | "hospital" | "tpa" | "insurer" | "admin"
  organization?: string | null
  phone?: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  })
  return res
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (res.ok) setUser(await res.json())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Login failed")
    }
    const data = await res.json()
    setUser(data)
  }, [])

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export const ROLE_LABELS: Record<string, string> = {
  customer: "Patient Party",
  hospital: "Hospital",
  tpa: "TPA",
  insurer: "Insurance Company",
  admin: "Admin",
}

export const ROLE_COLORS: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700",
  hospital: "bg-green-100 text-green-700",
  tpa: "bg-purple-100 text-purple-700",
  insurer: "bg-amber-100 text-amber-700",
  admin: "bg-red-100 text-red-700",
}
