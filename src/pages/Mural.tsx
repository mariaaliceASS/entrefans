import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { ListaFandoms, RolePublico } from '../types'
import Seo from '../components/Seo'
import CardRolePublico from '../components/CardRolePublico'

/** Listagem PÚBLICA 2: mural com os rolês abertos, com filtros (AJAX, sem recarregar a página). */
export default function Mural() {
  const [roles, setRoles] = useState<RolePublico[] | null>(null); const [temas, setTemas] = useState<ListaFandoms['fandoms']>([])
  const [f, setF] = useState({ formato: '', fandom: '' }); const [erro, setErro] = useState('')
  useEffect(() => { api.get<ListaFandoms>('/publico/fandoms').then(d => setTemas(d.fandoms)).catch(() => {}) }, [])
  useEffect(() => {
    setRoles(null)
    api.get<RolePublico[]>('/publico/roles?' + new URLSearchParams(Object.entries(f).filter(([, v]) => v))).then(setRoles).catch(e => setErro((e as Error).message))
  }, [f])

  return (
    <div className="space-y-5">
      <Seo titulo="Mural de rolês" descricao="Rolês abertos de fãs: shows, maratonas, mesas de RPG, convenções e encontros online. Encontre companhia para o seu fandom." />
      <div><h1 className="y2k-titulo">Mural de rolês</h1>
        <p className="text-sm text-on-surface-variant">Convites abertos de fãs para shows, maratonas, mesas de RPG, convenções… <Link to="/login" className="text-[var(--y2k)] underline">Entre</Link> para topar e ver os rolês perto de você.</p></div>
      <div className="flex flex-wrap gap-2">
        <select className="input !w-auto" aria-label="Formato" value={f.formato} onChange={e => setF({ ...f, formato: e.target.value })}>
          <option value="">Presenciais e online</option><option value="presencial">Só presenciais</option><option value="online">Só online</option></select>
        <select className="input !w-auto" aria-label="Fandom" value={f.fandom} onChange={e => setF({ ...f, fandom: e.target.value })}>
          <option value="">Todos os fandoms</option>{temas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
      </div>
      {erro && <p className="text-sm text-error">{erro}</p>}
      {!roles ? <p className="text-on-surface-variant">Carregando…</p> : roles.length === 0 ? <p className="card text-on-surface-variant">Nenhum rolê aberto com esses filtros.</p> :
        <div className="grid gap-4 md:grid-cols-2">{roles.map(c => <CardRolePublico key={c.id} c={c} />)}</div>}
    </div>
  )
}
