import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Perfil } from '../types'
import FotoUpload from '../components/FotoUpload'
import { InterestPicker } from '../components/Pickers'
import LocalizacaoPicker from '../components/Localizacao'
import { RedesEditor } from '../components/RedesSociais'
import { Icon } from '../components/Header'

const COMANDO_BIO = '/bio-auto'

export default function MeuPerfil() {
  const { logout, refresh } = useAuth(); const nav = useNavigate()
  const [p, setP] = useState<Perfil | null>(null); const [ints, setInts] = useState<number[]>([]); const [msg, setMsg] = useState('')
  const [ia, setIa] = useState({ carregando: false, erro: '' })
  useEffect(() => { api.get<Perfil>('/perfis/me').then(x => { setP(x); setInts(x.interesses.map(i => i.id)) }) }, [])
  if (!p) return <p className="text-on-surface-variant">Carregando…</p>
  const salvar = async () => {
    setMsg('')
    if (p.nome.trim().length < 2) { setMsg('Informe o nome de exibição.'); return }
    if (ints.length < 3) { setMsg('Escolha ao menos 3 interesses.'); return }
    try {
      const novo = await api.put<Perfil>('/perfis/me', { nome: p.nome, bio: p.bio, interesses: ints, redes: p.redes, redes_visibilidade: p.redes_visibilidade })
      setP(novo); await refresh(); setMsg('Alterações salvas!')
    } catch (e) { setMsg((e as Error).message) }
  }
  // Recurso com LLM: o backend manda os interesses salvos (e o que já foi escrito no campo) para o Gemini.
  // Disparado de dentro do campo: Tab com o campo vazio, ou digitando /bio-auto.
  const sugerirBio = async (descricao: string) => {
    setP({ ...p, bio: descricao }); setIa({ carregando: true, erro: '' })
    try {
      const r = await api.post<{ bio?: string }>('/ia/bio', { descricao })
      if (typeof r.bio !== 'string' || !r.bio) throw new Error('A IA não respondeu agora. Tente de novo em instantes.')
      const bio = r.bio
      setP(atual => atual && { ...atual, bio }); setIa({ carregando: false, erro: '' })
    }
    catch (e) { setIa({ carregando: false, erro: (e as Error).message }) }
  }
  const mudarBio = (texto: string) => {
    if (texto.toLowerCase().includes(COMANDO_BIO)) sugerirBio(texto.replace(new RegExp(COMANDO_BIO, 'gi'), '').trim())
    else setP({ ...p, bio: texto })
  }
  return (
    <div className="space-y-5">
      <h1 className="y2k-titulo">Meu Perfil e Preferências</h1>
      <section className="card space-y-3">
        <div><div className="font-headline text-xl font-semibold">{p.nome}</div><div className="text-sm text-on-surface-variant">@{p.username}</div></div>
        <FotoUpload nome={p.nome} foto={p.foto} onEnviada={foto => setP({ ...p, foto })} />
      </section>
      <section className="card space-y-3">
        <h2>Informações pessoais</h2>
        <div><label className="label" htmlFor="mp-nome">Nome de exibição</label><input id="mp-nome" className="input" required minLength={2} maxLength={80} value={p.nome} onChange={e => setP({ ...p, nome: e.target.value })} /></div>
        <div>
          <label className="label" htmlFor="mp-bio">Bio ({p.bio.length}/140)</label>
          <textarea id="mp-bio" className="input" rows={3} maxLength={140} value={p.bio} readOnly={ia.carregando} aria-busy={ia.carregando}
            aria-describedby="mp-bio-dica" placeholder={`Aperte Tab ou digite ${COMANDO_BIO} para criar uma bio a partir dos seus interesses`}
            onChange={e => mudarBio(e.target.value)}
            onKeyDown={e => {
              // Tab só gera com o campo vazio; com texto, segue o comportamento normal (ir para o próximo campo)
              if (e.key === 'Tab' && !e.shiftKey && !p.bio.trim() && !ia.carregando) { e.preventDefault(); sugerirBio('') }
            }} />
          <p id="mp-bio-dica" className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant" aria-live="polite">
            <Icon n="auto_awesome" />
            {ia.carregando ? 'Criando sua bio com IA…'
              : <>Campo vazio + <kbd className="font-mono font-bold">Tab</kbd>, ou <kbd className="font-mono font-bold">{COMANDO_BIO}</kbd> depois de escrever um pouco sobre você. Revise antes de salvar.</>}
          </p>
          {ia.erro && <p className="mt-1 text-xs text-error">{ia.erro}</p>}
        </div>
      </section>
      <section className="card space-y-3">
        <h2>Localização</h2>
        {/* salva na hora; mescla só os campos de localização para não perder edições ainda não salvas */}
        <LocalizacaoPicker valor={p} onSalvo={l => setP(atual => (atual ? { ...atual, ...l } : atual))} />
      </section>
      <section className="card space-y-3">
        <div><h2>Redes sociais</h2>
          <p className="text-sm text-on-surface-variant">É por aqui que outros fãs vão conseguir falar com você.</p></div>
        <RedesEditor redes={p.redes} visibilidade={p.redes_visibilidade} onChange={(redes, vis) => setP({ ...p, redes, redes_visibilidade: vis })} />
      </section>
      <section className="card space-y-3"><h2>Meus interesses ({ints.length})</h2><InterestPicker value={ints} onChange={setInts} /></section>
      {msg && <p className="text-sm text-tertiary">{msg}</p>}
      <div className="flex gap-3"><button onClick={salvar} className="btn-primary">Salvar alterações</button><button onClick={async () => { await logout(); nav('/login') }} className="btn-ghost">Sair da conta</button></div>
    </div>
  )
}
