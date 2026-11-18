import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../services/api'
import type { Usuario } from '../types'

interface Ctx { user: Usuario | null; loading: boolean; login: (l: string, s: string) => Promise<void>; register: (d: Record<string, unknown>) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void> }
const AuthCtx = createContext<Ctx>(null!)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = async () => { try { setUser(await api.get<Usuario>('/usuarios/me')) } catch { setUser(null) } }
  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])
  const login = async (l: string, senha: string) => setUser(await api.post<Usuario>('/auth/login', { login: l, senha }))
  const register = async (d: Record<string, unknown>) => setUser(await api.post<Usuario>('/auth/register', d))
  const logout = async () => { await api.post('/auth/logout').catch(() => {}); setUser(null) }
  return <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthCtx.Provider>
}
