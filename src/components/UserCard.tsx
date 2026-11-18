import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CardUsuario } from '../types'
import Avatar from './Avatar'
import InterestTag from './InterestTag'
import FollowButton from './FollowButton'
import { Icon } from './Header'

/** acoes: substitui o botão padrão de seguir (usado nas solicitações de conexão). nova: destaca o card com a etiqueta "Nova". */
export default function UserCard({ u, acoes, nova }: { u: CardUsuario; acoes?: ReactNode; nova?: boolean }) {
  const cidade = u.cidade ? `${u.cidade}${u.uf ? ' - ' + u.uf : ''}` : null
  return (
    <article className={`card flex flex-col gap-3 ${nova ? '!border-error' : ''}`}>
      <div className="flex items-start gap-3">
        <Link to={`/u/${u.id}`}><Avatar nome={u.nome} foto={u.foto} size={56} /></Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/u/${u.id}`} className="font-headline text-base font-semibold hover:text-[var(--y2k)]">{u.nome}</Link>
            {nova && <span className="y2k-selo border-error bg-error text-on-error">Nova</span>}
          </div>
          <div className="text-xs text-on-surface-variant">@{u.username}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-outline"><Icon n="near_me" />{cidade ?? 'Local não informado'}{u.distancia && <span className="y2k-selo ml-1 border-tertiary text-tertiary">{u.distancia}</span>}</div>
        </div>
        <div className="y2k-selo shrink-0 border-secondary bg-background py-1 text-xs text-secondary" title="Afinidade de interesses"><Icon n="favorite" fill />{u.compat}%</div>
      </div>
      {u.compartilhados.length > 0 && <div className="flex flex-wrap gap-1.5">{u.compartilhados.map(c => <InterestTag key={c} nome={c} destaque />)}</div>}
      <div className="flex flex-wrap gap-2"><Link to={`/u/${u.id}`} className="btn-ghost">Ver perfil</Link>{acoes ?? <FollowButton id={u.id} seguindo={u.seguindo} />}</div>
    </article>
  )
}
