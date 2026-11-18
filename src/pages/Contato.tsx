import { FormEvent, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Seo from '../components/Seo'
import { AlertaErro, AlertaOk } from '../components/JanelaAuth'
import { type Erros, validarContato } from '../services/validacao'

const ASSUNTOS = [['duvida', 'Dúvida'], ['sugestao', 'Sugestão'], ['problema', 'Problema técnico'], ['denuncia', 'Denúncia'], ['privacidade', 'Privacidade / LGPD'], ['outro', 'Outro']]
const MAX = 2000

/** Fale conosco: validação no front; o backend valida de novo, grava na tabela contatos e envia e-mail com mail(). */
export default function Contato() {
  const { user } = useAuth()
  const vazio = { nome: user?.nome ?? '', email: user?.email ?? '', assunto: '', mensagem: '' }
  const [f, setF] = useState(vazio); const [erros, setErros] = useState<Erros>({})
  const [erro, setErro] = useState(''); const [ok, setOk] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF({ ...f, [k]: e.target.value }); if (erros[k]) setErros({ ...erros, [k]: '' })
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErro(''); setOk('')
    const v = validarContato(f); setErros(v)
    if (Object.keys(v).length) return
    setBusy(true)
    try { setOk((await api.post<{ mensagem: string }>('/contato', f)).mensagem); setF({ ...vazio, nome: f.nome, email: f.email }) }
    catch (er) { setErro((er as Error).message) } finally { setBusy(false) }
  }
  const cls = (k: string) => `input ${erros[k] ? '!border-error' : ''}`
  const msgErro = (k: string) => erros[k] && <p className="mt-1 text-xs text-error">{erros[k]}</p>
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Seo titulo="Fale conosco" descricao="Envie dúvidas, sugestões, denúncias ou pedidos sobre seus dados (LGPD) para a equipe do EntreFans." />
      <div><h1 className="y2k-titulo">Fale conosco</h1>
        <p className="text-sm text-on-surface-variant">Dúvidas, sugestões, denúncias ou pedidos sobre seus dados pessoais. Respondemos no seu e-mail.</p></div>
      <form onSubmit={submit} className="card space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="ct-nome">Nome</label>
            <input id="ct-nome" className={cls('nome')} required minLength={2} maxLength={80} autoComplete="name" value={f.nome} onChange={set('nome')} />{msgErro('nome')}</div>
          <div><label className="label" htmlFor="ct-email">E-mail</label>
            <input id="ct-email" type="email" className={cls('email')} required maxLength={150} autoComplete="email" value={f.email} onChange={set('email')} />{msgErro('email')}</div>
        </div>
        <div><label className="label" htmlFor="ct-assunto">Assunto</label>
          <select id="ct-assunto" className={cls('assunto')} required value={f.assunto} onChange={set('assunto')}>
            <option value="">Escolha…</option>{ASSUNTOS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
          </select>{msgErro('assunto')}</div>
        <div><label className="label" htmlFor="ct-msg">Mensagem</label>
          <textarea id="ct-msg" rows={6} className={cls('mensagem')} required minLength={10} maxLength={MAX} value={f.mensagem} onChange={set('mensagem')} />
          <div className="flex justify-between">{msgErro('mensagem') || <span />}<span className="font-mono text-[10px] text-outline">{f.mensagem.length}/{MAX}</span></div></div>
        {erro && <AlertaErro msg={erro} />}
        {ok && <AlertaOk msg={ok} />}
        <button disabled={busy} className="btn-primary">{busy ? 'Enviando…' : 'Enviar mensagem'}</button>
      </form>
    </div>
  )
}
