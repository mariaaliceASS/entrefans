import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { CardUsuario, FeedChamados } from '../types'
import UserCard from '../components/UserCard'
import { Icon } from '../components/Header'

export default function Home() {
  const [list, setList] = useState<CardUsuario[] | null>(null); const [roles, setRoles] = useState<FeedChamados | null>(null)
  useEffect(() => {
    api.get<CardUsuario[]>('/recomendacoes').then(setList)
    api.get<FeedChamados>('/chamados').then(setRoles).catch(() => {})
  }, [])
  const abertos = roles?.chamados.filter(c => !c.eu_topo) ?? []
  return (
    <div className="space-y-5">
      <div><h1 className="y2k-titulo">Descobrir fãs na sua região</h1>
        <p className="text-sm text-on-surface-variant">Ordenado por afinidade de interesses e proximidade.</p></div>
      {abertos.length > 0 && (
        <Link to="/roles" className="card flex flex-wrap items-center gap-3 !border-secondary !shadow-[6px_6px_0_theme(colors.secondary-container)] transition hover:-translate-x-px hover:-translate-y-px">
          <span className="text-3xl text-secondary"><Icon n="campaign" /></span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">{abertos.length} {abertos.length === 1 ? 'rolê aberto' : 'rolês abertos'} dos seus fandoms</div>
            <p className="truncate text-sm">“{abertos[0].texto}” — {abertos[0].autor.nome.split(' ')[0]}</p>
          </div>
          <span className="font-mono text-xs font-bold uppercase text-secondary">Ver rolês ▸</span>
        </Link>
      )}
      {!list ? <p className="text-on-surface-variant">Carregando…</p> : list.length === 0 ?
        <p className="card text-on-surface-variant">Ainda não há fãs com interesses em comum. Convide amigos ou use a busca em Explorar!</p> :
        <div className="grid gap-4 md:grid-cols-2">{list.map(u => <UserCard key={u.id} u={u} />)}</div>}
    </div>
  )
}
