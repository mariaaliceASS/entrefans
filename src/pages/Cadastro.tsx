import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import JanelaAuth, { AlertaErro, Campo } from '../components/JanelaAuth'
import Seo from '../components/Seo'
import { type Erros, validarCadastro } from '../services/validacao'

/** Tela de cadastro de usuário. Validação no front (HTML + JS) e de novo no backend (AuthController::register). */
export default function Cadastro() {
  const { user, register } = useAuth(); const nav = useNavigate()
  const [f, setF] = useState({ nome: '', username: '', email: '', senha: '', confirmar_senha: '', aceite_termos: false })
  const [erros, setErros] = useState<Erros>({}); const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
    if (erros[k]) setErros({ ...erros, [k]: '' })
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErro('')
    const v = validarCadastro(f); setErros(v)
    if (Object.keys(v).length) return
    setBusy(true)
    try { await register({ ...f, username: f.username.trim().toLowerCase(), email: f.email.trim() }); nav('/onboarding') }
    catch (er) { setErro((er as Error).message) } finally { setBusy(false) }
  }
  const input = (k: 'nome' | 'username' | 'email' | 'senha' | 'confirmar_senha', props: React.InputHTMLAttributes<HTMLInputElement>) =>
    <input id={`c-${k}`} className={`y2k-input ${erros[k] ? '!border-error' : ''}`} required value={f[k]} onChange={set(k)}
      aria-invalid={!!erros[k]} aria-describedby={erros[k] ? `c-${k}-erro` : undefined} {...props} />

  return (
    <JanelaAuth titulo="Criar conta" subtitulo="Leva 1 minuto. Depois você escolhe sua cidade e seus fandoms.">
      <Seo titulo="Criar conta" descricao="Cadastre-se grátis no EntreFans para encontrar fãs dos seus fandoms perto de você e marcar rolês." />
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Campo id="c-nome" label="Nome" erro={erros.nome}>{input('nome', { minLength: 2, maxLength: 80, autoComplete: 'name' })}</Campo>
        <Campo id="c-username" label="Nome de usuário" erro={erros.username}>
          {input('username', { minLength: 3, maxLength: 30, pattern: '[a-z0-9_.]{3,30}', autoComplete: 'username', placeholder: 'ex.: fa.de.anime' })}</Campo>
        <Campo id="c-email" label="E-mail" erro={erros.email}>{input('email', { type: 'email', maxLength: 150, autoComplete: 'email' })}</Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="c-senha" label="Senha (8+, letras e números)" erro={erros.senha}>{input('senha', { type: 'password', minLength: 8, maxLength: 72, autoComplete: 'new-password' })}</Campo>
          <Campo id="c-confirmar_senha" label="Confirmar senha" erro={erros.confirmar_senha}>{input('confirmar_senha', { type: 'password', autoComplete: 'new-password' })}</Campo>
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--y2k)]" checked={f.aceite_termos} onChange={set('aceite_termos')} />
            <span>Li e aceito os <Link to="/termos" target="_blank" className="text-[var(--y2k)] underline">Termos de Uso</Link>, a <Link to="/termos#privacidade" target="_blank" className="text-[var(--y2k)] underline">Política de Privacidade (LGPD)</Link> e a <Link to="/termos#plagio" target="_blank" className="text-[var(--y2k)] underline">Política de Plágio</Link>.</span>
          </label>
          {erros.aceite_termos && <p className="mt-1 text-xs text-error">{erros.aceite_termos}</p>}
        </div>
        {erro && <AlertaErro msg={erro} />}
        <button disabled={busy} className="y2k-btn-primario">{busy ? 'Aguarde…' : 'Criar conta ▸'}</button>
      </form>
      <p className="mt-5 text-sm text-on-surface-variant">Já tem conta? <Link to="/login" className="font-semibold text-[var(--y2k)] hover:underline">Entrar</Link></p>
    </JanelaAuth>
  )
}
