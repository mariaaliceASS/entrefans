import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { DetalheRole } from '../types'
import Seo from '../components/Seo'
import Avatar from '../components/Avatar'
import { Icon } from '../components/Header'
import { cidadeUf, quandoTexto } from '../services/formato'

/**
 * Detalhe de 1 rolê. Busca em GET /api/detalhe/role/{id} (o mesmo PHP de fandoms e usuários).
 * "Eu topo!" funciona como o botão de compra: adiciona o rolê à Agenda (carrinho) e leva até ela.
 */
export default function RoleDetalhe() {
  const { id } = useParams(); const nav = useNavigate()
  const [d, setD] = useState<DetalheRole | null>(null); const [erro, setErro] = useState(''); const [ocupado, setOcupado] = useState(false)
  useEffect(() => { setD(null); setErro(''); api.get<DetalheRole>(`/detalhe/role/${id}`).then(setD).catch(e => setErro(e.message)) }, [id])
  if (erro && !d) return <p className="card text-error">{erro} <Link to="/mural" className="underline">Ver o mural</Link></p>
  if (!d) return <p className="text-on-surface-variant">Carregando…</p>

  const topar = async () => {
    setOcupado(true); setErro('')
    try { await api.post(`/chamados/${d.id}/topo`); nav('/agenda') } catch (e) { setErro((e as Error).message) } finally { setOcupado(false) }
  }
  const local = d.logado ? [d.autor.distancia, cidadeUf(d.autor.cidade, d.autor.uf)].filter(Boolean).join(' · ') : cidadeUf(d.autor.cidade, d.autor.uf)
  const tema = d.interesse.tema && d.interesse.tema !== d.interesse.nome ? `${d.interesse.tema} › ` : ''

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Seo titulo={`Rolê de ${d.interesse.nome}`} descricao={`${d.texto.slice(0, 150)} — rolê ${d.formato} no EntreFans.`} tipo="article" />
      <Link to={d.logado ? '/roles' : '/mural'} className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--y2k)] hover:underline">◂ Voltar</Link>
      <article className="card space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="y2k-selo border-[var(--y2k)] bg-[var(--y2k)] text-[var(--y2k-fundo)]"><Icon n={d.formato === 'online' ? 'wifi' : 'location_on'} />{d.formato}</span>
          <span className="y2k-selo border-secondary text-secondary"><Icon n="event" />{quandoTexto(d.quando)}</span>
          <Link to={`/fandom/${d.interesse.id}`} className="y2k-selo border-tertiary text-tertiary hover:underline">{tema}{d.interesse.nome}</Link>
          {d.encerrado && <span className="y2k-selo border-outline text-outline">Encerrado</span>}
        </div>
        <h1 className="whitespace-pre-line break-words font-headline text-2xl leading-snug">“{d.texto}”</h1>
        <div className="flex items-center gap-3 border-t-2 border-[var(--y2k-escuro)] pt-4 text-sm">
          {d.logado ? <>
            <Link to={`/u/${d.autor.id}`}><Avatar nome={d.autor.nome} foto={d.autor.foto} size={44} /></Link>
            <div><Link to={`/u/${d.autor.id}`} className="font-semibold hover:text-[var(--y2k)]">{d.autor.nome}</Link> <span className="text-outline">@{d.autor.username}</span>
              <div className="text-xs text-outline">{local || 'Local não informado'}</div></div>
          </> : <div><span className="font-semibold">{d.autor.nome}</span>{d.formato === 'presencial' && local && <div className="text-xs text-outline">{local}</div>}</div>}
        </div>
        <p className="font-mono text-xs text-on-surface-variant">{d.total === 0 ? 'Ninguém topou ainda.' : `${d.total} ${d.total === 1 ? 'pessoa topou' : 'pessoas toparam'}.`}
          {!d.quando && ' Sem data marcada: combinem pelo perfil.'}</p>
        {erro && <p className="text-sm text-error">{erro}</p>}
        <div className="flex flex-wrap gap-2">
          {!d.logado ? <Link to={`/login?voltar=/role/${d.id}`} className="btn-primary"><Icon n="front_hand" />Entre para topar</Link>
            : d.meu ? <Link to="/roles" className="btn-ghost">É o seu rolê — ver quem topou</Link>
            : d.eu_topo ? <Link to="/agenda" className="btn-ghost"><Icon n="check" />Já está na sua agenda</Link>
            : !d.encerrado && <button disabled={ocupado} onClick={topar} className="btn-primary"><Icon n="front_hand" />Eu topo! (adicionar à agenda)</button>}
        </div>
      </article>
      <p className="flex items-center gap-2 text-xs text-outline"><Icon n="shield" />Encontros presenciais: combine em local público e não compartilhe endereço. Veja os <Link to="/termos" className="underline">termos</Link>.</p>
    </div>
  )
}
