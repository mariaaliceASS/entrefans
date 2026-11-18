import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Localizacao, Perfil } from '../types'
import { InterestPicker } from '../components/Pickers'
import LocalizacaoPicker from '../components/Localizacao'
import { Icon } from '../components/Header'
import FotoUpload from '../components/FotoUpload'

export default function Onboarding() {
  const { user, refresh } = useAuth(); const nav = useNavigate()
  const [loc, setLoc] = useState<Localizacao | null>(null)
  const [ints, setInts] = useState<number[]>([]); const [erro, setErro] = useState(''); const [foto, setFoto] = useState<string | null>(null)
  useEffect(() => { api.get<Perfil>('/perfis/me').then(p => { setLoc(p); setFoto(p.foto); setInts(p.interesses.map(i => i.id)) }) }, [])
  const ok = !!loc?.tem_localizacao && ints.length >= 3
  const salvar = async () => {
    try { await api.put('/perfis/me', { nome: user!.nome, bio: '', interesses: ints }); await refresh(); nav('/') }
    catch (e) { setErro((e as Error).message) }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--y2k)]"><Icon n="radar" />Passo 2 de 3 — Encontre fãs perto de você</div>
      <section className="card space-y-3">
        <h2>Sua foto (opcional)</h2>
        <FotoUpload nome={user!.nome} foto={foto} onEnviada={setFoto} />
      </section>
      <section className="card space-y-3">
        <h2>Onde você está?</h2>
        <LocalizacaoPicker valor={loc} onSalvo={setLoc} />
      </section>
      <section className="card space-y-3">
        <div className="flex items-center justify-between"><h2>O que você ama acompanhar?</h2><span className="text-xs text-on-surface-variant">{ints.length} selecionados (mínimo 3)</span></div>
        <InterestPicker value={ints} onChange={setInts} />
      </section>
      {erro && <p className="text-sm text-error">{erro}</p>}
      {!loc?.tem_localizacao && <p className="text-xs text-on-surface-variant">Defina sua localização para continuar.</p>}
      <button disabled={!ok} onClick={salvar} className="btn-primary w-full">Continuar para o Descobrir</button>
    </div>
  )
}
