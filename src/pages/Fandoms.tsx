import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { ListaFandoms } from '../types'
import Seo from '../components/Seo'
import { Icon } from '../components/Header'

/** Listagem PÚBLICA 1: fandoms (temas de interesse) com número de fãs e de rolês abertos. Busca via AJAX. */
export default function Fandoms() {
  const [dados, setDados] = useState<ListaFandoms | null>(null); const [erro, setErro] = useState('')
  const [f, setF] = useState({ q: '', categoria: '' })
  const carregar = (filtro = f) => {
    const p = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v))
    api.get<ListaFandoms>('/publico/fandoms?' + p).then(setDados).catch(e => setErro((e as Error).message))
  }
  useEffect(() => { carregar() }, [])
  const buscar = (e: FormEvent) => { e.preventDefault(); carregar() }
  const cats = dados ? [...new Set(dados.fandoms.map(x => x.categoria))] : []

  return (
    <div className="space-y-5">
      <Seo titulo="Fandoms" descricao="Explore os fandoms do EntreFans: K-pop, animes, games, séries, RPG de mesa, livros e mais. Veja quantos fãs e rolês cada um tem." />
      <div><h1 className="y2k-titulo">Fandoms</h1>
        <p className="text-sm text-on-surface-variant">Escolha um fandom para ver os fãs e os rolês abertos. Para participar, <Link to="/cadastro" className="text-[var(--y2k)] underline">crie sua conta</Link>.</p></div>
      <form onSubmit={buscar} className="card grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="input" placeholder="Buscar fandom, banda, anime, jogo…" maxLength={60} value={f.q} onChange={e => setF({ ...f, q: e.target.value })} aria-label="Buscar fandom" />
        <select className="input" aria-label="Categoria" value={f.categoria} onChange={e => { const n = { ...f, categoria: e.target.value }; setF(n); carregar(n) }}>
          <option value="">Todas as categorias</option>{dados?.categorias.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-primary"><Icon n="search" />Buscar</button>
      </form>
      {erro && <p className="text-sm text-error">{erro}</p>}
      {!dados ? <p className="text-on-surface-variant">Carregando…</p> : dados.fandoms.length === 0 ? <p className="card text-on-surface-variant">Nenhum fandom encontrado.</p> :
        cats.map(c => (
          <section key={c} className="space-y-2">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--y2k)]">✦ {c}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dados.fandoms.filter(x => x.categoria === c).map(x => (
                <Link key={x.id} to={`/fandom/${x.id}`} className="card flex flex-col gap-2 transition hover:-translate-x-px hover:-translate-y-px">
                  <span className="font-headline text-lg font-semibold">{x.nome}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <span className="y2k-selo border-secondary text-secondary"><Icon n="group" />{x.fas} {x.fas === 1 ? 'fã' : 'fãs'}</span>
                    <span className="y2k-selo border-tertiary text-tertiary"><Icon n="campaign" />{x.roles} {x.roles === 1 ? 'rolê' : 'rolês'}</span>
                    {x.itens > 0 && <span className="y2k-selo border-outline text-outline">{x.itens} itens</span>}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}
