import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import JanelaAuth, { AlertaErro, Campo, InputSenha } from '../components/JanelaAuth'
import Seo from '../components/Seo'

/** Para onde voltar depois de entrar (?voltar=/role/3). Só caminhos internos. */
export const destino = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/')

export default function Login() {
  const { user, login } = useAuth(); const nav = useNavigate(); const [params] = useSearchParams()
  const [f, setF] = useState({ login: '', senha: '' })
  const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false)
  const voltar = destino(params.get('voltar'))
  if (user) return <Navigate to={voltar} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErro('')
    if (!f.login.trim() || !f.senha) { setErro('Informe o login e a senha.'); return }
    setBusy(true)
    try { await login(f.login.trim(), f.senha); nav(voltar) } catch (er) { setErro((er as Error).message) } finally { setBusy(false) }
  }
  return (
    <JanelaAuth titulo="Entrar no EntreFans" subtitulo="Conecte-se com pessoas da sua região que compartilham os mesmos gostos.">
      <Seo titulo="Entrar" descricao="Entre no EntreFans e encontre fãs perto de você que curtem os mesmos animes, bandas, jogos e séries." />
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Campo id="f-login" label="E-mail ou nome de usuário">
          <input id="f-login" className="y2k-input" required autoComplete="username" maxLength={150} value={f.login} onChange={e => setF({ ...f, login: e.target.value })} />
        </Campo>
        <Campo id="f-senha" label="Senha">
          <InputSenha id="f-senha" required autoComplete="current-password" value={f.senha} onChange={e => setF({ ...f, senha: e.target.value })} />
        </Campo>
        <div className="text-right"><Link to="/esqueci-senha" className="font-mono text-xs font-bold uppercase text-[var(--y2k)] hover:underline">Esqueci minha senha</Link></div>
        {erro && <AlertaErro msg={erro} />}
        <button disabled={busy} className="y2k-btn-primario">{busy ? 'Aguarde…' : 'Entrar ▸'}</button>
      </form>
      <p className="mt-5 text-sm text-on-surface-variant">Ainda não tem conta? <Link to="/cadastro" className="font-semibold text-[var(--y2k)] hover:underline">Criar conta</Link></p>
    </JanelaAuth>
  )
}
