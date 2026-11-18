import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { DetalheFandom } from '../types'
import Seo from '../components/Seo'
import CardRolePublico from '../components/CardRolePublico'
import { Icon } from '../components/Header'

/** Detalhe de 1 fandom. Busca em GET /api/detalhe/fandom/{id} (o mesmo PHP que detalha rolês e usuários). */
export default function FandomDetalhe() {
  const { id } = useParams(); const [d, setD] = useState<DetalheFandom | null>(null); const [erro, setErro] = useState('')
  useEffect(() => { setD(null); setErro(''); api.get<DetalheFandom>(`/detalhe/fandom/${id}`).then(setD).catch(e => setErro(e.message)) }, [id])
  if (erro) return <p className="card text-error">{erro} <Link to="/fandoms" className="underline">Ver todos os fandoms</Link></p>
  if (!d) return <p className="text-on-surface-variant">Carregando…</p>
  return (
    <div className="space-y-5">
      <Seo titulo={d.nome} descricao={`${d.nome} (${d.categoria}) no EntreFans: ${d.fas} ${d.fas === 1 ? 'fã' : 'fãs'} e ${d.roles.length} rolês abertos. Encontre quem curte ${d.nome} perto de você.`} />
      <nav className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--y2k)]">
        <Link to="/fandoms" className="hover:underline">Fandoms</Link> › {d.categoria}{d.tema && <> › <Link to={`/fandom/${d.tema.id}`} className="hover:underline">{d.tema.nome}</Link></>}
      </nav>
      <section className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="y2k-titulo">{d.nome}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="y2k-selo border-secondary text-secondary"><Icon n="group" />{d.fas} {d.fas === 1 ? 'fã' : 'fãs'}</span>
            <span className="y2k-selo border-tertiary text-tertiary"><Icon n="campaign" />{d.roles.length} rolês abertos</span>
          </div>
        </div>
        {!d.logado ? <Link to="/cadastro" className="btn-primary"><Icon n="person_add" />Criar conta e achar fãs de {d.nome}</Link>
          : d.eu_tenho ? <span className="y2k-selo border-tertiary px-3 py-1.5 text-xs text-tertiary"><Icon n="check" />Está nos seus interesses</span>
          : <Link to="/perfil" className="btn-primary"><Icon n="add" />Adicionar aos meus interesses</Link>}
      </section>
      {d.itens.length > 0 && (
        <section className="card space-y-3"><h2>Dentro de {d.nome}</h2>
          <div className="flex flex-wrap gap-2">{d.itens.map(i => (
            <Link key={i.id} to={`/fandom/${i.id}`} className="inline-flex items-center gap-1 border-2 border-[var(--y2k-escuro)] bg-background px-2.5 py-1 text-xs font-semibold hover:border-[var(--y2k)]">
              {i.nome}{i.fas > 0 && <span className="font-mono text-[10px] text-[var(--y2k)]">{i.fas}</span>}</Link>))}</div>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--y2k)]">✦ Rolês abertos</h2>
        {d.roles.length === 0 ? <p className="card text-sm text-on-surface-variant">Nenhum rolê aberto de {d.nome} agora. {d.logado && <Link to="/roles" className="text-[var(--y2k)] underline">Que tal criar um?</Link>}</p>
          : <div className="grid gap-4 md:grid-cols-2">{d.roles.map(c => <CardRolePublico key={c.id} c={c} />)}</div>}
      </section>
    </div>
  )
}
