import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Agendado } from '../types'
import Avatar from '../components/Avatar'
import { Icon } from '../components/Header'
import { cidadeUf, quandoTexto } from '../services/formato'

/**
 * "Carrinho" do EntreFans: a Agenda com os rolês que você topou (relação n..n usuários x rolês, tabela chamado_participantes).
 * O "Eu topo!" adiciona aqui; "Desistir" remove (como tirar um item do carrinho).
 */
export default function Agenda() {
  const [lista, setLista] = useState<Agendado[] | null>(null); const [erro, setErro] = useState(''); const [ocupado, setOcupado] = useState(0)
  useEffect(() => { api.get<Agendado[]>('/chamados/agenda').then(setLista).catch(e => setErro(e.message)) }, [])
  const desistir = async (c: Agendado) => {
    if (!confirm(`Desistir do rolê de ${c.autor.nome.split(' ')[0]}?`)) return
    setOcupado(c.id)
    try { await api.del(`/chamados/${c.id}/topo`); setLista(l => l!.filter(x => x.id !== c.id)) } catch (e) { setErro((e as Error).message) } finally { setOcupado(0) }
  }
  const abertos = lista?.filter(c => !c.encerrado).length ?? 0
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="y2k-titulo">Minha agenda</h1>
          <p className="text-sm text-on-surface-variant">Os rolês que você topou. {lista && `${abertos} ${abertos === 1 ? 'rolê confirmado' : 'rolês confirmados'}.`}</p></div>
        <Link to="/roles" className="btn-primary"><Icon n="add" />Topar mais rolês</Link>
      </div>
      {erro && <p className="text-sm text-error">{erro}</p>}
      {!lista ? <p className="text-on-surface-variant">Carregando…</p> : lista.length === 0 ?
        <div className="card space-y-3 text-on-surface-variant"><p>Sua agenda está vazia. Clique em “Eu topo!” em um rolê para ele aparecer aqui.</p>
          <div className="flex gap-2"><Link to="/roles" className="btn-primary">Rolês perto de mim</Link><Link to="/mural" className="btn-ghost">Mural</Link></div></div> :
        <ul className="space-y-3">{lista.map(c => (
          <li key={c.id} className={`card flex flex-col gap-3 sm:flex-row sm:items-center ${c.encerrado ? 'opacity-60' : ''}`}>
            <div className="flex shrink-0 flex-col items-center border-2 border-secondary bg-background px-3 py-2 font-mono text-xs font-bold uppercase text-secondary sm:w-28">
              <Icon n="event" />{quandoTexto(c.quando)}</div>
            <div className="min-w-0 flex-1 space-y-1">
              <Link to={`/role/${c.id}`} className="line-clamp-2 font-headline text-base hover:text-[var(--y2k)]">“{c.texto}”</Link>
              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <Link to={`/u/${c.autor.id}`} className="flex items-center gap-1.5 font-semibold hover:text-[var(--y2k)]"><Avatar nome={c.autor.nome} foto={c.autor.foto} size={20} />{c.autor.nome}</Link>
                <span className="y2k-selo border-tertiary text-tertiary">{c.interesse.nome}</span>
                <span>{c.formato === 'online' ? 'Online' : [c.autor.distancia, cidadeUf(c.autor.cidade, c.autor.uf)].filter(Boolean).join(' · ')}</span>
                {c.encerrado && <span className="y2k-selo border-outline text-outline">Encerrado</span>}
              </div>
            </div>
            {!c.encerrado && <button disabled={ocupado === c.id} onClick={() => desistir(c)} className="btn-ghost shrink-0"><Icon n="close" />Desistir</button>}
          </li>))}</ul>}
      <p className="text-xs text-on-surface-variant">Quem criou o rolê vê que você topou. Sigam-se para virar conexão e combinar pelas redes sociais.</p>
    </div>
  )
}
