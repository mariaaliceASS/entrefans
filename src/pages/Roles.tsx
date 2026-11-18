import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { atualizarNotificacoes } from '../services/notificacoes'
import type { Chamado, FeedChamados, MeuChamado, Perfil } from '../types'
import Avatar from '../components/Avatar'
import { Icon } from '../components/Header'
import { diaLocal, quandoTexto } from '../services/formato'

// Mesmas regras do backend (ChamadoController)
const RAIOS = [5, 10, 25, 50, 100]
const DIAS_MAX = 60
const MAX_TEXTO = 280

/**
 * Card de um rolê. No feed mostra "Eu topo!" (adiciona à Agenda, o "carrinho", e vai para ela);
 * nos meus, a lista de quem topou e o botão de encerrar.
 */
function CardRole({ c, onMudou }: { c: Chamado | MeuChamado; onMudou: () => void }) {
  const [estado, setEstado] = useState({ eu_topo: c.eu_topo, total: c.total }); const [ocupado, setOcupado] = useState(false)
  const nav = useNavigate()
  const meu = 'participantes' in c ? c : null
  const cidade = c.autor.cidade ? `${c.autor.cidade}${c.autor.uf ? ' - ' + c.autor.uf : ''}` : null
  const topar = async () => {
    setOcupado(true)
    try {
      if (estado.eu_topo) setEstado(await api.del<typeof estado>(`/chamados/${c.id}/topo`))
      else { await api.post(`/chamados/${c.id}/topo`); nav('/agenda') }
    } finally { setOcupado(false) }
  }
  const encerrar = async () => {
    if (!confirm('Encerrar este rolê? Ele some do feed de todo mundo.')) return
    setOcupado(true); try { await api.del(`/chamados/${c.id}`); onMudou() } finally { setOcupado(false) }
  }
  const novos = meu?.participantes.filter(p => p.novo).length ?? 0
  return (
    <article className={`card flex flex-col gap-3 ${meu?.encerrado ? 'opacity-60' : ''} ${novos ? '!border-error' : ''}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="y2k-selo border-[var(--y2k)] bg-[var(--y2k)] text-[var(--y2k-fundo)]"><Icon n={c.formato === 'online' ? 'wifi' : 'location_on'} />{c.formato}</span>
        <span className="y2k-selo border-secondary text-secondary"><Icon n="event" />{quandoTexto(c.quando)}</span>
        <span className="y2k-selo border-tertiary text-tertiary">{c.interesse.tema && c.interesse.tema !== c.interesse.nome ? `${c.interesse.tema} › ` : ''}{c.interesse.nome}</span>
        {meu?.encerrado && <span className="y2k-selo border-outline text-outline">Encerrado</span>}
        {novos > 0 && <span className="y2k-selo border-error bg-error text-on-error">{novos} {novos === 1 ? 'nova' : 'novas'}</span>}
      </div>
      <p className="whitespace-pre-line break-words font-headline text-lg leading-snug">“{c.texto}”</p>
      {!meu && (
        <div className="flex items-center gap-2 text-xs">
          <Link to={`/u/${c.autor.id}`}><Avatar nome={c.autor.nome} foto={c.autor.foto} size={32} /></Link>
          <div className="min-w-0">
            <Link to={`/u/${c.autor.id}`} className="font-semibold hover:text-[var(--y2k)]">{c.autor.nome}</Link>
            <div className="flex flex-wrap items-center gap-1 text-outline"><Icon n="near_me" />{cidade ?? 'Local não informado'}{c.autor.distancia && <span className="y2k-selo ml-1 border-tertiary text-tertiary">{c.autor.distancia}</span>}</div>
          </div>
        </div>
      )}
      {meu && (
        <div>
          <div className="label">{meu.participantes.length ? `Quem topou (${meu.participantes.length})` : 'Ninguém topou ainda'}</div>
          {meu.participantes.length > 0 && <ul className="flex flex-wrap gap-2">{meu.participantes.map(p => (
            <li key={p.id}><Link to={`/u/${p.id}`} className={`flex items-center gap-2 border-2 bg-background py-1 pl-1 pr-2.5 text-xs font-semibold hover:-translate-x-px hover:-translate-y-px ${p.novo ? 'border-error' : 'border-[var(--y2k-escuro)]'}`}>
              <Avatar nome={p.nome} foto={p.foto} size={24} />{p.nome.split(' ')[0]}<span className="text-outline">@{p.username}</span></Link></li>))}</ul>}
          {meu.participantes.length > 0 && <p className="mt-2 text-xs text-on-surface-variant">Abra o perfil e siga quem topou: quando virarem conexão, vocês veem as redes sociais um do outro para combinar.</p>}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {!meu && <button disabled={ocupado} onClick={topar} className={estado.eu_topo ? 'btn-ghost' : 'btn-primary'}>
          <Icon n={estado.eu_topo ? 'check' : 'front_hand'} />{estado.eu_topo ? 'Topei' : 'Eu topo!'}</button>}
        {meu && !meu.encerrado && <button disabled={ocupado} onClick={encerrar} className="btn-ghost">Encerrar</button>}
        <Link to={`/role/${c.id}`} className="btn-ghost">Detalhes</Link>
        {!meu && <span className="font-mono text-xs text-on-surface-variant">{estado.total === 0 ? 'Seja o primeiro!' : `${estado.total} ${estado.total === 1 ? 'topou' : 'toparam'}`}</span>}
      </div>
      {!meu && estado.eu_topo && <p className="text-xs text-on-surface-variant">{c.autor.nome.split(' ')[0]} vai ver que você topou. Sigam-se para virar conexão e trocar contatos.</p>}
    </article>
  )
}

function NovoRole({ perfil, onCriado, onCancelar }: { perfil: Perfil; onCriado: () => void; onCancelar: () => void }) {
  const [f, setF] = useState({ interesse_id: '', texto: '', formato: perfil.tem_localizacao ? 'presencial' : 'online', quando: '' })
  const [erro, setErro] = useState(''); const [ocupado, setOcupado] = useState(false)
  const hoje = new Date(); const max = new Date(); max.setDate(max.getDate() + DIAS_MAX)
  // Interesses do perfil agrupados por tema (o tema também pode ser escolhido)
  const grupos = useMemo(() => {
    const temas = perfil.interesses.filter(i => i.pai_id === null).sort((a, b) => a.nome.localeCompare(b.nome))
    return temas.map(t => ({ tema: t, itens: perfil.interesses.filter(i => i.pai_id === t.id).sort((a, b) => a.nome.localeCompare(b.nome)) }))
  }, [perfil])
  const enviar = async (e: FormEvent) => {
    e.preventDefault(); setErro(''); setOcupado(true)
    try { await api.post('/chamados', { ...f, interesse_id: Number(f.interesse_id), quando: f.quando || null }); onCriado() }
    catch (er) { setErro((er as Error).message) } finally { setOcupado(false) }
  }
  return (
    <form onSubmit={enviar} className="card space-y-4">
      <h2>Novo rolê</h2>
      <div>
        <label className="label" htmlFor="role-texto">O que você quer fazer?</label>
        <textarea id="role-texto" className="input min-h-[84px] resize-y" maxLength={MAX_TEXTO} required value={f.texto} onChange={e => setF({ ...f, texto: e.target.value })}
          placeholder="Ex.: Procuro companhia pro show do Stray Kids em SP! Vou de pista." />
        <div className="mt-1 text-right font-mono text-[10px] text-outline">{f.texto.length}/{MAX_TEXTO}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="role-int">Fandom</label>
          <select id="role-int" className="input" required value={f.interesse_id} onChange={e => setF({ ...f, interesse_id: e.target.value })}>
            <option value="">Escolha um interesse do seu perfil</option>
            {grupos.map(g => <optgroup key={g.tema.id} label={g.tema.nome}>
              <option value={g.tema.id}>{g.tema.nome} (geral)</option>
              {g.itens.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </optgroup>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="role-data">Quando (opcional)</label>
          <input id="role-data" type="date" className="input" value={f.quando} min={diaLocal(hoje)} max={diaLocal(max)} onChange={e => setF({ ...f, quando: e.target.value })} />
        </div>
      </div>
      <div>
        <div className="label">Formato</div>
        <div role="radiogroup" className="flex max-w-sm">
          {(['presencial', 'online'] as const).map((v, i) => {
            const bloqueado = v === 'presencial' && !perfil.tem_localizacao
            return <button key={v} type="button" role="radio" aria-checked={f.formato === v} disabled={bloqueado} onClick={() => setF({ ...f, formato: v })}
              className={'y2k-aba disabled:opacity-40 ' + (i ? '-ml-0.5 ' : '') + (f.formato === v ? 'bg-[var(--y2k)] text-[var(--y2k-fundo)]' : 'y2k-aba-inativa bg-background text-[var(--y2k)]')}>{v}</button>
          })}
        </div>
        <p className="mt-1.5 text-xs text-on-surface-variant">{f.formato === 'presencial'
          ? 'Aparece para fãs perto de você. Não coloque endereço nem horário exato: combinem depois, de preferência em local público.'
          : 'Aparece para fãs do mesmo interesse em qualquer cidade.'}{!perfil.tem_localizacao && ' Defina sua localização no perfil para criar rolês presenciais.'}</p>
      </div>
      <p className="text-xs text-outline">Sem data, o rolê fica aberto por 7 dias. Você pode ter até 3 rolês abertos.</p>
      {erro && <p className="text-sm text-error">{erro}</p>}
      <div className="flex flex-wrap gap-2"><button disabled={ocupado} className="btn-primary"><Icon n="campaign" />Publicar rolê</button><button type="button" onClick={onCancelar} className="btn-ghost">Cancelar</button></div>
    </form>
  )
}

type Aba = 'perto' | 'meus'
export default function Roles() {
  const [aba, setAba] = useState<Aba>('perto'); const [criando, setCriando] = useState(false)
  const [filtro, setFiltro] = useState({ filtro: 'afins', raio_km: '50' })
  const [feed, setFeed] = useState<FeedChamados | null>(null); const [meus, setMeus] = useState<MeuChamado[] | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null); const [erro, setErro] = useState('')

  const carregarFeed = () => api.get<FeedChamados>('/chamados?' + new URLSearchParams(filtro)).then(setFeed).catch(e => setErro((e as Error).message))
  const carregarMeus = () => api.get<MeuChamado[]>('/chamados/meus').then(m => {
    setMeus(m)
    // Mostra quem é novo destacado e só depois marca como visto (a bolinha some)
    if (m.some(c => c.participantes.some(p => p.novo))) api.post('/chamados/vistos').then(atualizarNotificacoes)
    return m
  })
  useEffect(() => { api.get<Perfil>('/perfis/me').then(setPerfil); carregarMeus() }, [])
  useEffect(() => { carregarFeed() }, [filtro])

  const novos = meus?.reduce((n, c) => n + c.participantes.filter(p => p.novo).length, 0) ?? 0
  const abertos = meus?.filter(c => !c.encerrado).length ?? 0
  const lista = aba === 'perto' ? feed?.chamados : meus

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="y2k-titulo">Rolês</h1>
          <p className="max-w-xl text-sm text-on-surface-variant">Chame fãs para um show, uma maratona, uma mesa de RPG… Quem curte o mesmo fandom perto de você pode topar.</p></div>
        {!criando && <button onClick={() => setCriando(true)} disabled={abertos >= 3} title={abertos >= 3 ? 'Você já tem 3 rolês abertos' : undefined} className="btn-primary"><Icon n="add" />Novo rolê</button>}
      </div>

      {criando && perfil && <NovoRole perfil={perfil} onCancelar={() => setCriando(false)} onCriado={() => { setCriando(false); setAba('meus'); carregarMeus(); carregarFeed() }} />}

      <div role="tablist" className="flex w-full max-w-sm">
        {([['perto', 'Perto de você', feed?.chamados.length], ['meus', 'Meus rolês', meus?.length]] as const).map(([id, nome, n], i) => (
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
            className={'y2k-aba relative ' + (i ? '-ml-0.5 ' : '') + (aba === id ? 'bg-[var(--y2k)] text-[var(--y2k-fundo)]' : 'y2k-aba-inativa bg-background text-[var(--y2k)]')}>
            {nome} {n !== undefined && <span className="opacity-70">({n})</span>}
            {id === 'meus' && novos > 0 && <span className="y2k-aviso" aria-label={`${novos} novas pessoas toparam`} />}
          </button>
        ))}
      </div>

      {aba === 'perto' && (
        <div className="flex flex-wrap gap-2">
          <select className="input !w-auto" aria-label="Quais rolês" value={filtro.filtro} onChange={e => setFiltro({ ...filtro, filtro: e.target.value })}>
            <option value="afins">Dos meus interesses</option><option value="todos">Todos os fandoms</option></select>
          <select className="input !w-auto" aria-label="Distância dos presenciais" value={filtro.raio_km} onChange={e => setFiltro({ ...filtro, raio_km: e.target.value })}>
            {RAIOS.map(r => <option key={r} value={r}>Presenciais até {r} km</option>)}</select>
        </div>
      )}
      {aba === 'perto' && feed && !feed.tem_localizacao && <p className="text-xs text-on-surface-variant">Você ainda não definiu sua localização: aparecem só os rolês online. <Link to="/perfil" className="text-[var(--y2k)] underline">Definir no perfil</Link></p>}
      {erro && <p className="text-sm text-error">{erro}</p>}

      {!lista ? <p className="text-on-surface-variant">Carregando…</p> : lista.length === 0 ?
        <div className="card space-y-3 text-on-surface-variant">
          <p>{aba === 'perto' ? (filtro.filtro === 'afins' ? 'Nenhum rolê dos seus fandoms por perto agora.' : 'Nenhum rolê por perto agora.') : 'Você ainda não chamou ninguém para um rolê.'}</p>
          <div className="flex flex-wrap gap-2">
            {!criando && <button onClick={() => setCriando(true)} className="btn-primary">Criar o primeiro</button>}
            {aba === 'perto' && filtro.filtro === 'afins' && <button onClick={() => setFiltro({ ...filtro, filtro: 'todos' })} className="btn-ghost">Ver todos os fandoms</button>}
          </div>
        </div> :
        <div className="grid gap-4 md:grid-cols-2">{lista.map(c => <CardRole key={`${aba}-${c.id}`} c={c} onMudou={() => { carregarMeus(); carregarFeed() }} />)}</div>}
    </div>
  )
}
