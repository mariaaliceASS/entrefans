import { ChangeEvent, useState } from 'react'
import { api } from '../services/api'
import Avatar from './Avatar'

const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 5

/** Envio da foto de perfil (multipart). O PHP confere o tipo real do arquivo e salva em backend/uploads com nome aleatório. */
export default function FotoUpload({ nome, foto, onEnviada, tamanho = 80 }: { nome: string; foto: string | null; onEnviada: (url: string) => void; tamanho?: number }) {
  const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false)
  const enviar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''; setErro('')
    if (!file) return
    if (!TIPOS.includes(file.type)) { setErro('Use uma imagem JPG, PNG ou WEBP.'); return }
    if (file.size > MAX_MB * 1024 * 1024) { setErro(`A imagem deve ter até ${MAX_MB} MB.`); return }
    const fd = new FormData(); fd.append('foto', file)
    setBusy(true)
    try { onEnviada((await api.post<{ foto: string }>('/perfis/me/foto', fd)).foto) } catch (er) { setErro((er as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar nome={nome} foto={foto} size={tamanho} />
      <div>
        <label className="btn-ghost cursor-pointer">{busy ? 'Enviando…' : foto ? 'Trocar foto' : 'Enviar foto'}
          <input type="file" accept={TIPOS.join(',')} hidden disabled={busy} onChange={enviar} /></label>
        <p className="mt-1 text-xs text-on-surface-variant">JPG, PNG ou WEBP, até {MAX_MB} MB.</p>
        {erro && <p className="mt-1 text-xs text-error">{erro}</p>}
      </div>
    </div>
  )
}
