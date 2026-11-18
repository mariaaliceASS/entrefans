import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'

/** Telas que exigem login. Sem sessão: vai para o login (e volta para cá depois). Perfil incompleto: vai para o onboarding. */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  if (loading) return <div className="p-10 text-center text-on-surface-variant">Carregando…</div>
  if (!user) return <Navigate to={`/login?voltar=${encodeURIComponent(pathname)}`} replace />
  if (!user.perfil_completo && pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return (
    <div className="flex min-h-screen flex-col">
      {pathname !== '/onboarding' && <Header />}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"><Outlet /></main>
      <Footer />
    </div>
  )
}
