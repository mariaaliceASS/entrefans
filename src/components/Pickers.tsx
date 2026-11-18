import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import type { Interesse, ResultadoBusca } from '../types'
import InterestTag from './InterestTag'
import { Icon } from './Header'

/** Textos do painel de cada tema, conforme a API que o alimenta */
const FONTE_UI: Record<string, { titulo: string; busca: string }> = {
  musica: { titulo: 'Artistas e grupos', busca: 'Buscar artista ou grupo…' },
  series: { titulo: 'Séries', busca: 'Buscar série…' },
  doramas: { titulo: 'Doramas', busca: 'Buscar dorama…' },
  filmes: { titulo: 'Filmes e franquias', busca: 'Buscar filme ou franquia…' },
  anime: { titulo: 'Animes', busca: 'Buscar anime…' },
  manga: { titulo: 'Mangás e HQs', busca: 'Buscar mangá ou HQ…' },
  games: { titulo: 'Jogos', busca: 'Buscar jogo…' },
  livros: { titulo: 'Livros e sagas', busca: 'Buscar livro ou saga…' },
}
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * Escolha de interesses em 2 níveis: categoria > tema (K-pop) > itens do tema (BTS, aespa...).
 * Clicar em um tema o seleciona e abre o painel com os itens; escolher um item marca o tema junto.
 */
export function InterestPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const [all, setAll] = useState<Interesse[]>([]); const [busca, setBusca] = useState(''); const [aberto, setAberto] = useState<number | null>(null)
  useEffect(() => { api.get<Interesse[]>('/interesses').then(setAll) }, [])

  const temas = all.filter(i => i.pai_id === null)
  const itensDe = (temaId: number) => all.filter(i => i.pai_id === temaId)
  const escolhidosDe = (temaId: number) => itensDe(temaId).filter(i => value.includes(i.id)).length
  const temaAtivo = (t: Interesse) => value.includes(t.id) || escolhidosDe(t.id) > 0

  const clicarTema = (t: Interesse) => {
    if (!temaAtivo(t)) { onChange([...value, t.id]); setAberto(t.id) }
    else setAberto(aberto === t.id ? null : t.id)
  }
  const removerTema = (t: Interesse) => {
    const fora = new Set([t.id, ...itensDe(t.id).map(i => i.id)])
    onChange(value.filter(v => !fora.has(v))); setAberto(null)
  }
  const alternarItem = (item: Interesse) => {
    if (value.includes(item.id)) onChange(value.filter(v => v !== item.id))
    else onChange([...new Set([...value, item.id, item.pai_id!])]) // item escolhido => tema junto
  }
  const adicionarItem = async (tema: Interesse, nome: string) => {
    const novo = await api.post<Interesse>('/interesses', { nome, pai_id: tema.id })
    setAll(a => (a.some(x => x.id === novo.id) ? a : [...a, novo]))
    onChange([...new Set([...value, novo.id, tema.id])])
  }
  const criarTema = async () => {
    const n = await api.post<Interesse>('/interesses', { nome: busca.trim() })
    setAll(a => (a.some(x => x.id === n.id) ? a : [...a, n])); onChange([...new Set([...value, n.id])]); setBusca(''); setAberto(n.id)
  }

  // Pesquisa geral: filtra temas pelo nome e também mostra itens que combinam (ex.: "bts" acha BTS em K-pop)
  const b = sem(busca)
  const temasVisiveis = b ? temas.filter(t => sem(t.nome).includes(b) || itensDe(t.id).some(i => sem(i.nome).includes(b))) : temas
  const itensAchados = b.length > 1 ? all.filter(i => i.pai_id !== null && sem(i.nome).includes(b)).slice(0, 24) : []
  const nomeTema = (id: number | null) => temas.find(t => t.id === id)?.nome ?? ''
  const existeTema = temas.some(t => sem(t.nome) === b)
  const cats = [...new Set(temasVisiveis.map(i => i.categoria))]

  return (
    <div className="space-y-4">
      <input className="input" placeholder="Pesquisar tema, grupo, série, jogo…" value={busca} onChange={e => setBusca(e.target.value)} />
      <p className="text-xs text-on-surface-variant">Toque em um tema para escolher grupos, artistas, séries, animes ou jogos dentro dele.</p>
      {itensAchados.length > 0 && (
        <div><div className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">Encontrados</div>
          <div className="flex flex-wrap gap-2">{itensAchados.map(i => <InterestTag key={i.id} nome={`${i.nome} · ${nomeTema(i.pai_id)}`} ativo={value.includes(i.id)} onClick={() => alternarItem(i)} />)}</div></div>
      )}
      {busca.trim().length > 1 && !existeTema && <button type="button" onClick={criarTema} className="btn-ghost">+ Criar tema “{busca.trim()}”</button>}
      {cats.map(c => {
        const temasCat = temasVisiveis.filter(t => t.categoria === c)
        const temaAberto = temasCat.find(t => t.id === aberto)
        return (
          <div key={c}>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">{c}</div>
            <div className="flex flex-wrap gap-2">
              {temasCat.map(t => <InterestTag key={t.id} nome={t.nome} ativo={temaAtivo(t)} badge={escolhidosDe(t.id)} aberto={aberto === t.id}
                icone={temaAtivo(t) ? (aberto === t.id ? 'expand_less' : 'expand_more') : 'add'} onClick={() => clicarTema(t)} />)}
            </div>
            {temaAberto && <PainelTema key={temaAberto.id} tema={temaAberto} itens={itensDe(temaAberto.id)} value={value} onAlternar={alternarItem}
              onAdicionar={nome => adicionarItem(temaAberto, nome)} onRemoverTema={() => removerTema(temaAberto)} onFechar={() => setAberto(null)} />}
          </div>
        )
      })}
    </div>
  )
}

function PainelTema({ tema, itens, value, onAlternar, onAdicionar, onRemoverTema, onFechar }: {
  tema: Interesse; itens: Interesse[]; value: number[]; onAlternar: (i: Interesse) => void
  onAdicionar: (nome: string) => Promise<void>; onRemoverTema: () => void; onFechar: () => void
}) {
  const ui = (tema.fonte && FONTE_UI[tema.fonte]) || { titulo: 'Itens', busca: 'Filtrar ou adicionar…' }
  const [q, setQ] = useState(''); const [remotos, setRemotos] = useState<ResultadoBusca[]>([])
  const [carregando, setCarregando] = useState(false); const [erro, setErro] = useState(''); const [mostrarTodos, setMostrarTodos] = useState(false)
  const req = useRef(0)

  // Busca na API externa do tema, com espera de 450ms após parar de digitar
  useEffect(() => {
    setRemotos([]); setErro('')
    if (!tema.fonte || q.trim().length < 2) { setCarregando(false); return }
    const id = ++req.current; setCarregando(true)
    const t = setTimeout(() => {
      api.get<ResultadoBusca[]>(`/interesses/${tema.id}/buscar?q=${encodeURIComponent(q.trim())}`)
        .then(r => { if (id === req.current) setRemotos(r) })
        .catch(() => { if (id === req.current) setErro('Não foi possível buscar agora. Você ainda pode adicionar pelo nome.') })
        .finally(() => { if (id === req.current) setCarregando(false) })
    }, 450)
    return () => clearTimeout(t)
  }, [q, tema.id, tema.fonte])

  const f = sem(q)
  const locais = itens.filter(i => sem(i.nome).includes(f))
    .sort((a, b) => Number(value.includes(b.id)) - Number(value.includes(a.id))) // escolhidos primeiro
  const LIMITE = 24
  const visiveis = f || mostrarTodos ? locais : locais.slice(0, LIMITE)
  const nomesLocais = new Set(itens.map(i => sem(i.nome)))
  const novos = remotos.filter(r => !nomesLocais.has(sem(r.nome)))
  const podeAdicionar = q.trim().length > 1 && !nomesLocais.has(f) && !remotos.some(r => sem(r.nome) === f)
  const adicionar = async (nome: string) => { try { await onAdicionar(nome) } catch (e) { setErro((e as Error).message) } }

  return (
    <div className="mt-3 space-y-3 border-2 border-tertiary bg-surface-container p-3 shadow-[4px_4px_0_theme(colors.tertiary-container)]">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-tertiary">✦ {tema.nome} <span className="font-normal text-on-surface-variant">· {ui.titulo}</span></div>
        <div className="flex gap-1">
          <button type="button" onClick={onRemoverTema} className="border-2 border-error px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-error hover:bg-error hover:text-on-error">Remover tema</button>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="flex h-6 w-6 items-center justify-center border-2 border-[var(--y2k)] bg-background text-[var(--y2k)] hover:bg-[var(--y2k)] hover:text-[var(--y2k-fundo)]"><Icon n="close" /></button>
        </div>
      </div>
      <input className="input" placeholder={ui.busca} value={q} onChange={e => setQ(e.target.value)} />
      {visiveis.length > 0 && <div className="flex flex-wrap gap-2">{visiveis.map(i => <InterestTag key={i.id} nome={i.nome} ativo={value.includes(i.id)} onClick={() => onAlternar(i)} />)}</div>}
      {!f && !mostrarTodos && locais.length > LIMITE && <button type="button" onClick={() => setMostrarTodos(true)} className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--y2k)] hover:underline">Ver todos ({locais.length})</button>}
      {f && visiveis.length === 0 && !tema.fonte && <p className="text-xs text-on-surface-variant">Nenhum item com esse nome ainda.</p>}
      {carregando && <p className="text-xs text-on-surface-variant">Buscando…</p>}
      {novos.length > 0 && (
        <div><div className="mb-1 text-xs font-bold uppercase tracking-wider text-outline">Mais resultados</div>
          <div className="flex flex-wrap gap-2">{novos.map(r => <InterestTag key={r.nome} nome={r.nome} title={r.detalhe} icone="add" suave onClick={() => adicionar(r.nome)} />)}</div></div>
      )}
      {podeAdicionar && !carregando && <button type="button" onClick={() => adicionar(q.trim())} className="btn-ghost text-xs">+ Adicionar “{q.trim()}” em {tema.nome}</button>}
      {erro && <p className="text-xs text-error">{erro}</p>}
    </div>
  )
}

/** Mostra interesses agrupados: tema seguido dos itens escolhidos dentro dele */
export function InterestGroups({ interesses, destacar = [] }: { interesses: Interesse[]; destacar?: string[] }) {
  const temas = interesses.filter(i => i.pai_id === null)
  const orfaos = interesses.filter(i => i.pai_id !== null && !temas.some(t => t.id === i.pai_id))
  return (
    <div className="space-y-2">
      {temas.map(t => {
        const itens = interesses.filter(i => i.pai_id === t.id)
        return (
          <div key={t.id} className="flex flex-wrap items-center gap-2">
            <InterestTag nome={t.nome} destaque={destacar.includes(t.nome)} />
            {itens.length > 0 && <span className="text-outline">›</span>}
            {itens.map(i => <InterestTag key={i.id} nome={i.nome} suave={!destacar.includes(i.nome)} destaque={destacar.includes(i.nome)} />)}
          </div>
        )
      })}
      {orfaos.length > 0 && <div className="flex flex-wrap gap-2">{orfaos.map(i => <InterestTag key={i.id} nome={i.nome} destaque={destacar.includes(i.nome)} />)}</div>}
    </div>
  )
}
