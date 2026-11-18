import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { PerfilPublico } from '../types'
import Avatar from '../components/Avatar'
import FollowButton from '../components/FollowButton'
import InterestTag from '../components/InterestTag'
import { InterestGroups } from '../components/Pickers'
import { RedesLista } from '../components/RedesSociais'
import { Icon } from '../components/Header'

/** Detalhe de 1 usuário. Busca em GET /api/detalhe/usuario/{id} (o mesmo PHP de fandoms e rolês). */
export default function PerfilUsuario() {
  const { id } = useParams(); const [u, setU] = useState<PerfilPublico | null>(null); const [erro, setErro] = useState('')
  const carregar = () => api.get<PerfilPublico>(`/detalhe/usuario/${id}`).then(setU).catch(e => setErro(e.message))
  useEffect(() => { setU(null); carregar() }, [id])
  if (erro) return <p className="text-error">{erro}</p>
  if (!u) return <p className="text-on-surface-variant">Carregando…</p>
  const local = [u.distancia, u.cidade && `${u.cidade}${u.uf ? ', ' + u.uf : ''}`].filter(Boolean).join(' · ')
  return (
    <div className="space-y-5">
      <Link to="/" className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--y2k)] hover:underline">◂ Voltar</Link>
      <section className="card flex flex-col items-center gap-4 sm:flex-row">
        <Avatar nome={u.nome} foto={u.foto} size={96} />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="y2k-titulo">{u.nome}</h1>
          <div className="text-sm text-on-surface-variant">@{u.username}</div>
          <div className="mt-1 flex items-center justify-center gap-1 text-sm text-outline sm:justify-start"><Icon n="near_me" />{local || 'Local não informado'}</div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-on-surface-variant sm:justify-start">
            {u.seguidores} seguidores · {u.seguindo_total} seguindo
            {u.conexao ? <span className="y2k-selo border-tertiary text-tertiary">Conexão</span>
              : u.segue_voce && <span className="y2k-selo border-[var(--y2k)] text-[var(--y2k)]">Segue você</span>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="y2k-selo border-secondary bg-background px-3 py-1.5 text-xs text-secondary"><Icon n="favorite" fill />{u.compat}% afinidade</div>
          <FollowButton key={String(u.seguindo)} id={u.id} seguindo={u.seguindo} onChange={() => carregar()} textoSeguir={u.segue_voce ? 'Aceitar conexão' : 'Seguir'} />
        </div>
      </section>
      <section className="card"><h2 className="mb-3">Sobre mim</h2><p className="text-sm text-on-surface-variant">{u.bio || 'Sem biografia.'}</p></section>
      <section className="card"><h2 className="mb-3">Redes sociais</h2>
        <RedesLista redes={u.redes} status={u.redes_status} nome={u.nome} seguindo={u.seguindo} segueVoce={u.segue_voce} /></section>
      {u.compartilhados.length > 0 && <section className="card"><h2 className="mb-3">Interesses em comum</h2><div className="flex flex-wrap gap-2">{u.compartilhados.map(c => <InterestTag key={c} nome={c} destaque />)}</div></section>}
      <section className="card"><h2 className="mb-3">Fandoms e interesses</h2><InterestGroups interesses={u.interesses} destacar={u.compartilhados} /></section>
      <p className="flex items-center gap-2 text-xs text-outline"><Icon n="shield" />Mostramos apenas a cidade e a distância em faixas. A localização exata nunca é guardada nem exibida.</p>
    </div>
  )
}
