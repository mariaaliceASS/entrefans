import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header, { Icon } from './Header'
import Footer from './Footer'

/** Cabeçalho para quem não está logado */
function HeaderPublico() {
  const link = ({ isActive }: { isActive: boolean }) => 'y2k-menu-item' + (isActive ? ' ativo' : '')
  return (
    <header className="y2k-menu y2k-grade">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/fandoms" className="shrink-0" aria-label="EntreFans — início">
          <img src="/logo.png" alt="EntreFans" width={941} height={457} className="h-11 w-auto drop-shadow-[0_0_10px_rgba(177,76,255,0.4)]" />
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Menu público">
          <NavLink to="/fandoms" className={link}><Icon n="interests" />Fandoms</NavLink>
          <NavLink to="/mural" className={link}><Icon n="campaign" />Mural</NavLink>
          <NavLink to="/login" className={link}><Icon n="login" />Entrar</NavLink>
          <NavLink to="/cadastro" className={link}><Icon n="person_add" />Criar conta</NavLink>
        </nav>
      </div>
    </header>
  )
}

/** Layout das telas públicas: quem está logado vê o menu do app; visitante vê o menu público. */
export default function PublicLayout() {
  const { user, loading } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      {!loading && (user ? <Header /> : <HeaderPublico />)}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"><Outlet /></main>
      <Footer />
    </div>
  )
}
