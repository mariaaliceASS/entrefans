import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { atualizarNotificacoes } from '../services/notificacoes'
import type { CardUsuario, Conexoes as Dados, Solicitacao } from '../types'
import UserCard from '../components/UserCard'

type Aba = 'solicitacoes' | 'conexoes' | 'aguardando'
const ABAS: { id: Aba; nome: string; vazio: string; desc: string }[] = [
  { id: 'solicitacoes', nome: 'Solicitações', desc: 'Fãs que seguiram você. Aceite para virarem uma conexão e verem os contatos um do outro.', vazio: 'Nenhuma solicitação por enquanto.' },
  { id: 'conexoes', nome: 'Conexões', desc: 'Vocês se seguem: dá para ver as redes sociais um do outro (se a pessoa permitir).', vazio: 'Você ainda não tem conexões. Siga fãs em Descobrir ou Explorar!' },
  { id: 'aguardando', nome: 'Aguardando', desc: 'Você segue, mas a pessoa ainda não seguiu de volta.', vazio: 'Ninguém aguardando.' },
]

function AcoesSolicitacao({ u, onFeito }: { u: Solicitacao; onFeito: () => void }) {
  const [ocupado, setOcupado] = useState(false)
  const agir = async (f: () => Promise<unknown>) => { setOcupado(true); try { await f(); onFeito() } finally { setOcupado(false) } }
  return <>
    <button disabled={ocupado} onClick={() => agir(() => api.post(`/seguidores/${u.id}`))} className="btn-primary">Aceitar</button>
    <button disabled={ocupado} onClick={() => agir(() => api.del(`/seguidores/${u.id}/remover`))} className="btn-ghost" title={`${u.nome.split(' ')[0]} deixa de seguir você`}>Recusar</button>
  </>
}

export default function Conexoes() {
  const [dados, setDados] = useState<Dados | null>(null); const [aba, setAba] = useState<Aba | null>(null)
  const carregar = () => api.get<Dados>('/conexoes').then(d => { setDados(d); return d })

  useEffect(() => {
    // Mostra as novas destacadas e só depois marca como vistas (a bolinha some)
    carregar().then(d => {
      setAba(a => a ?? (d.solicitacoes.length ? 'solicitacoes' : 'conexoes'))
      if (d.solicitacoes.some(s => s.nova)) api.post('/notificacoes/vistas').then(atualizarNotificacoes)
    })
  }, [])

  if (!dados || !aba) return <p className="text-on-surface-variant">Carregando…</p>
  const atual = ABAS.find(a => a.id === aba)!
  const lista: (CardUsuario | Solicitacao)[] = dados[aba]
  const novas = dados.solicitacoes.filter(s => s.nova).length

  return (
    <div className="space-y-5">
      <div><h1 className="y2k-titulo">Suas conexões</h1><p className="text-sm text-on-surface-variant">{atual.desc}</p></div>
      <div role="tablist" className="flex w-full max-w-lg">
        {ABAS.map(t => (
          <button key={t.id} role="tab" aria-selected={aba === t.id} onClick={() => setAba(t.id)}
            className={'y2k-aba relative ' + (t.id !== 'solicitacoes' ? '-ml-0.5 ' : '') + (aba === t.id ? 'bg-[var(--y2k)] text-[var(--y2k-fundo)]' : 'y2k-aba-inativa bg-background text-[var(--y2k)]')}>
            {t.nome} <span className="opacity-70">({dados[t.id].length})</span>
            {t.id === 'solicitacoes' && novas > 0 && <span className="y2k-aviso" aria-label={`${novas} novas`} />}
          </button>
        ))}
      </div>
      {lista.length === 0 ? <p className="card text-on-surface-variant">{atual.vazio}</p> :
        <div className="grid gap-4 md:grid-cols-2">{lista.map(u => aba === 'solicitacoes'
          ? <UserCard key={u.id} u={u} nova={(u as Solicitacao).nova} acoes={<AcoesSolicitacao u={u as Solicitacao} onFeito={() => { carregar(); atualizarNotificacoes() }} />} />
          : <UserCard key={u.id} u={u} />)}</div>}
    </div>
  )
}
