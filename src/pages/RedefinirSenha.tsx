import { FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import JanelaAuth, { AlertaErro, AlertaOk, Campo } from '../components/JanelaAuth'
import Seo from '../components/Seo'
import { type Erros, validarSenha } from '../services/validacao'

/** Recuperação de senha, passo 2: aberta pelo link do e-mail (?token=...). */
export default function RedefinirSenha() {
  const [params] = useSearchParams(); const token = params.get('token') ?? ''
  const [f, setF] = useState({ senha: '', confirmar_senha: '' }); const [erros, setErros] = useState<Erros>({})
  const [erro, setErro] = useState(''); const [ok, setOk] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErro('')
    const v = validarSenha(f.senha, f.confirmar_senha); setErros(v)
    if (Object.keys(v).length) return
    setBusy(true)
    try { setOk((await api.post<{ mensagem: string }>('/auth/redefinir-senha', { token, ...f })).mensagem) }
    catch (er) { setErro((er as Error).message) } finally { setBusy(false) }
  }
  return (
    <JanelaAuth titulo="Criar nova senha">
      <Seo titulo="Nova senha" descricao="Crie uma nova senha para sua conta do EntreFans." />
      {!/^[a-f0-9]{64}$/.test(token) ? <div className="mt-6"><AlertaErro msg="Link inválido. Peça uma nova recuperação de senha." /><Link to="/esqueci-senha" className="y2k-btn-secundario mt-4">Pedir novo link</Link></div>
        : ok ? <div className="mt-6 space-y-4"><AlertaOk msg={ok} /><Link to="/login" className="y2k-btn-primario">Ir para o login ▸</Link></div>
        : <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Campo id="n-senha" label="Nova senha (8+, letras e números)" erro={erros.senha}>
            <input id="n-senha" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className="y2k-input" value={f.senha} onChange={e => setF({ ...f, senha: e.target.value })} />
          </Campo>
          <Campo id="n-confirmar" label="Confirmar nova senha" erro={erros.confirmar_senha}>
            <input id="n-confirmar" type="password" required autoComplete="new-password" className="y2k-input" value={f.confirmar_senha} onChange={e => setF({ ...f, confirmar_senha: e.target.value })} />
          </Campo>
          {erro && <AlertaErro msg={erro} />}
          <button disabled={busy} className="y2k-btn-primario">{busy ? 'Salvando…' : 'Salvar nova senha ▸'}</button>
        </form>}
    </JanelaAuth>
  )
}
