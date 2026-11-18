import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotificacoes } from '../services/notificacoes'

export const Icon = ({ n, fill }: { n: string; fill?: boolean }) => <span className={'msym' + (fill ? ' fill' : '')}>{n}</span>

/** Menu principal no visual Y2K: botões quadrados com borda roxa; o da página atual fica preenchido. */
export default function Header() {
  const { user } = useAuth()
  const { solicitacoes_novas: novas, chamados_novos: topos } = useNotificacoes(!!user)
  const link = ({ isActive }: { isActive: boolean }) => 'y2k-menu-item' + (isActive ? ' ativo' : '')
  return (
    <header className="y2k-menu y2k-grade">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="shrink-0" aria-label="EntreFans — início">
          <img src="/logo.png" alt="EntreFans" width={941} height={457} className="h-11 w-auto drop-shadow-[0_0_10px_rgba(177,76,255,0.4)]" />
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Menu principal">
          <NavLink to="/" end className={link}><Icon n="auto_awesome" />Descobrir</NavLink>
          <NavLink to="/explorar" className={link}><Icon n="search" />Explorar</NavLink>
          <NavLink to="/roles" className={link}>
            <Icon n="campaign" />Rolês
            {topos > 0 && <span className="y2k-aviso" aria-hidden />}
            {topos > 0 && <span className="sr-only"> ({topos} {topos === 1 ? 'pessoa topou' : 'pessoas toparam'} seus rolês)</span>}
          </NavLink>
          <NavLink to="/agenda" className={link}><Icon n="event_available" />Agenda</NavLink>
          <NavLink to="/conexoes" className={link}>
            <Icon n="group" />Conexões
            {novas > 0 && <span className="y2k-aviso" aria-hidden />}
            {novas > 0 && <span className="sr-only"> ({novas} {novas === 1 ? 'nova solicitação' : 'novas solicitações'})</span>}
          </NavLink>
          <NavLink to="/perfil" className={link}><Icon n="person" />{user?.nome.split(' ')[0] ?? 'Perfil'}</NavLink>
        </nav>
      </div>
    </header>
  )
}
