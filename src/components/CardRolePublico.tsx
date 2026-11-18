import { Link } from 'react-router-dom'
import type { RolePublico } from '../types'
import { cidadeUf, quandoTexto } from '../services/formato'
import { Icon } from './Header'

/** Cartão de rolê na versão pública (mural e página de fandom). Clicar abre o detalhe. */
export default function CardRolePublico({ c }: { c: RolePublico }) {
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="y2k-selo border-[var(--y2k)] bg-[var(--y2k)] text-[var(--y2k-fundo)]"><Icon n={c.formato === 'online' ? 'wifi' : 'location_on'} />{c.formato}</span>
        <span className="y2k-selo border-secondary text-secondary"><Icon n="event" />{quandoTexto(c.quando)}</span>
        <Link to={`/fandom/${c.interesse.id}`} className="y2k-selo border-tertiary text-tertiary hover:bg-tertiary hover:text-on-tertiary">
          {c.interesse.tema && c.interesse.tema !== c.interesse.nome ? `${c.interesse.tema} › ` : ''}{c.interesse.nome}</Link>
      </div>
      <p className="line-clamp-3 break-words font-headline text-lg leading-snug">“{c.texto}”</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1"><Icon n="person" />{c.autor.nome}{c.formato === 'presencial' && cidadeUf(c.autor.cidade, c.autor.uf) && <> · {cidadeUf(c.autor.cidade, c.autor.uf)}</>}</span>
        <span className="font-mono">{c.total} {c.total === 1 ? 'topou' : 'toparam'}</span>
      </div>
      <Link to={`/role/${c.id}`} className="btn-ghost">Ver detalhes</Link>
    </article>
  )
}
