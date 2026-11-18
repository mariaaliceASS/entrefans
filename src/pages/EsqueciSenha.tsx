import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import JanelaAuth, { AlertaErro, AlertaOk, Campo } from '../components/JanelaAuth'
import Seo from '../components/Seo'
import { EMAIL_RE } from '../services/validacao'

/** Recuperação de senha, passo 1: pede o e-mail; o backend envia um link com token válido por 1 hora. */
export default function EsqueciSenha() {
  const [email, setEmail] = useState(''); const [erro, setErro] = useState(''); const [ok, setOk] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErro(''); setOk('')
    if (!EMAIL_RE.test(email.trim())) { setErro('Informe um e-mail válido.'); return }
    setBusy(true)
    try { setOk((await api.post<{ mensagem: string }>('/auth/esqueci-senha', { email: email.trim() })).mensagem) }
    catch (er) { setErro((er as Error).message) } finally { setBusy(false) }
  }
  return (
    <JanelaAuth titulo="Esqueci minha senha" subtitulo="Informe o e-mail da sua conta. Vamos mandar um link para você criar uma senha nova.">
      <Seo titulo="Recuperar senha" descricao="Recupere o acesso à sua conta do EntreFans." />
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Campo id="r-email" label="E-mail">
          <input id="r-email" type="email" required maxLength={150} autoComplete="email" className="y2k-input" value={email} onChange={e => setEmail(e.target.value)} />
        </Campo>
        {erro && <AlertaErro msg={erro} />}
        {ok && <AlertaOk msg={ok} />}
        <button disabled={busy} className="y2k-btn-primario">{busy ? 'Enviando…' : 'Enviar link ▸'}</button>
      </form>
      <p className="mt-5 text-sm text-on-surface-variant"><Link to="/login" className="font-semibold text-[var(--y2k)] hover:underline">◂ Voltar para o login</Link></p>
    </JanelaAuth>
  )
}
