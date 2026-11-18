import { useState } from 'react'
import type { Rede, Redes, VisibilidadeRedes } from '../types'
import { Icon } from './Header'

export const REDES: { id: Rede; nome: string; link: (u: string) => string | null; exemplo: string; cor: string }[] = [
  { id: 'instagram', nome: 'Instagram', link: u => `https://instagram.com/${u}`, exemplo: '@seu.usuario', cor: '#E1306C' },
  { id: 'tiktok', nome: 'TikTok', link: u => `https://tiktok.com/@${u}`, exemplo: '@seu.usuario', cor: '#25F4EE' },
  { id: 'x', nome: 'X (Twitter)', link: u => `https://x.com/${u}`, exemplo: '@seu_usuario', cor: '#A0A0A0' },
  { id: 'discord', nome: 'Discord', link: () => null, exemplo: 'seu.usuario', cor: '#5865F2' },
  { id: 'twitch', nome: 'Twitch', link: u => `https://twitch.tv/${u}`, exemplo: 'seu_canal', cor: '#9146FF' },
  { id: 'youtube', nome: 'YouTube', link: u => `https://youtube.com/@${u}`, exemplo: '@seucanal', cor: '#FF0000' },
]

const VIS: { id: VisibilidadeRedes; nome: string; desc: string }[] = [
  { id: 'conexoes', nome: 'Só conexões', desc: 'Quem você segue e também segue você.' },
  { id: 'todos', nome: 'Todos os usuários', desc: 'Qualquer pessoa logada no EntreFans.' },
  { id: 'ninguem', nome: 'Só eu', desc: 'Ninguém vê seus contatos.' },
]

const Marca = ({ cor }: { cor: string }) => <span aria-hidden className="inline-block h-2.5 w-2.5 shrink-0" style={{ background: cor }} />

/** Edição das redes no "Meu Perfil" */
export function RedesEditor({ redes, visibilidade, onChange }: {
  redes: Redes; visibilidade: VisibilidadeRedes; onChange: (redes: Redes, vis: VisibilidadeRedes) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {REDES.map(r => (
          <div key={r.id}>
            <label className="label flex items-center gap-1.5" htmlFor={`rede-${r.id}`}><Marca cor={r.cor} />{r.nome}</label>
            <input id={`rede-${r.id}`} className="input" placeholder={r.exemplo} value={redes[r.id] ?? ''} maxLength={120} autoComplete="off"
              onChange={e => onChange({ ...redes, [r.id]: e.target.value }, visibilidade)} />
          </div>
        ))}
      </div>
      <p className="text-xs text-on-surface-variant">Pode digitar o @ ou colar o link do perfil. Por segurança, não aceitamos número de telefone.</p>
      <fieldset>
        <legend className="label">Quem pode ver meus contatos</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {VIS.map(v => (
            <label key={v.id} className={`cursor-pointer border-2 p-3 text-sm transition ${visibilidade === v.id ? 'border-[var(--y2k)] bg-background shadow-[4px_4px_0_var(--y2k-escuro)]' : 'border-[var(--y2k-escuro)] bg-background hover:border-[var(--y2k)]'}`}>
              <input type="radio" name="redes_vis" className="sr-only" checked={visibilidade === v.id} onChange={() => onChange(redes, v.id)} />
              <div className="font-semibold">{v.nome}</div><div className="text-xs text-on-surface-variant">{v.desc}</div>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

/** Exibição das redes no perfil de outra pessoa (respeitando a visibilidade escolhida por ela) */
export function RedesLista({ redes, status, nome, seguindo, segueVoce }: {
  redes: Redes; status: 'visivel' | 'nenhuma' | 'conexoes' | 'ninguem'; nome: string; seguindo: boolean; segueVoce: boolean
}) {
  const [copiado, setCopiado] = useState('')
  const primeiro = nome.split(' ')[0]
  if (status === 'nenhuma') return <p className="text-sm text-on-surface-variant">{primeiro} ainda não adicionou redes sociais.</p>
  if (status === 'ninguem') return <p className="text-sm text-on-surface-variant">{primeiro} preferiu manter os contatos privados.</p>
  if (status === 'conexoes') {
    const falta = !seguindo && !segueVoce ? `Sigam um ao outro para ver os contatos de ${primeiro}.`
      : !seguindo ? `${primeiro} já segue você. Siga de volta para ver os contatos.`
      : `Você já segue ${primeiro}. Os contatos aparecem quando ${primeiro} seguir você de volta.`
    return <p className="flex items-center gap-2 text-sm text-on-surface-variant"><Icon n="lock" />{falta}</p>
  }
  const copiar = async (rede: string, u: string) => {
    try { await navigator.clipboard.writeText(u); setCopiado(rede); setTimeout(() => setCopiado(''), 1500) } catch { /* sem permissão de clipboard */ }
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {REDES.filter(r => redes[r.id]).map(r => {
        const u = redes[r.id]!; const href = r.link(u)
        const conteudo = <><Marca cor={r.cor} /><span className="text-on-surface-variant">{r.nome}</span><span className="font-semibold">{r.id === 'discord' ? u : `@${u}`}</span></>
        const cls = 'inline-flex items-center gap-1.5 border-2 border-[var(--y2k)] bg-background px-3 py-1.5 text-xs transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--y2k-escuro)]'
        return (
          <li key={r.id}>
            {href ? <a className={cls} href={href} target="_blank" rel="noopener noreferrer nofollow">{conteudo}<Icon n="open_in_new" /></a>
              : <button type="button" className={cls} onClick={() => copiar(r.id, u)} title="Copiar nome de usuário">{conteudo}<Icon n={copiado === r.id ? 'check' : 'content_copy'} /></button>}
          </li>
        )
      })}
    </ul>
  )
}
