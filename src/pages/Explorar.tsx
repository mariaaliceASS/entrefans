import { FormEvent, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { CardUsuario } from '../types'
import UserCard from '../components/UserCard'

// Mesmas faixas do backend (LocalizacaoService::RAIOS)
const RAIOS = [5, 10, 25, 50, 100]

export default function Explorar() {
  const [f, setF] = useState({ q: '', interesse: '', raio_km: '' })
  const [res, setRes] = useState<CardUsuario[] | null>(null); const [erro, setErro] = useState('')
  const buscar = async (e?: FormEvent) => {
    e?.preventDefault(); setErro('')
    const p = new URLSearchParams(Object.entries(f).filter(([, v]) => v))
    try { setRes(await api.get<CardUsuario[]>('/usuarios/busca?' + p)) } catch (er) { setErro((er as Error).message); setRes(null) }
  }
  useEffect(() => { buscar() }, [])
  return (
    <div className="space-y-5">
      <h1 className="y2k-titulo">Explorar</h1>
      <form onSubmit={buscar} className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Nome de usuário" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
        <input className="input" placeholder="Fandom ou interesse" value={f.interesse} onChange={e => setF({ ...f, interesse: e.target.value })} />
        <select className="input" aria-label="Distância" value={f.raio_km} onChange={e => setF({ ...f, raio_km: e.target.value })}>
          <option value="">Qualquer distância</option>{RAIOS.map(r => <option key={r} value={r}>Até {r} km</option>)}</select>
        <button className="btn-primary">Buscar</button>
      </form>
      {erro && <p className="text-sm text-error">{erro}</p>}
      {res && (res.length ? <div className="grid gap-4 md:grid-cols-2">{res.map(u => <UserCard key={u.id} u={u} />)}</div> : <p className="text-on-surface-variant">Nenhum fã encontrado.</p>)}
    </div>
  )
}
