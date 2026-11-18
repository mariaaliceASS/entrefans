import { useState } from 'react'
import { api } from '../services/api'
import { atualizarNotificacoes } from '../services/notificacoes'

/** textoSeguir: ex. "Aceitar conexão" quando a pessoa já segue você */
export default function FollowButton({ id, seguindo, onChange, textoSeguir = 'Seguir' }: { id: number; seguindo: boolean; onChange?: (s: boolean) => void; textoSeguir?: string }) {
  const [on, setOn] = useState(seguindo); const [busy, setBusy] = useState(false)
  const toggle = async () => {
    setBusy(true)
    try { await (on ? api.del(`/seguidores/${id}`) : api.post(`/seguidores/${id}`)); setOn(!on); onChange?.(!on); atualizarNotificacoes() } finally { setBusy(false) }
  }
  return <button disabled={busy} onClick={toggle} className={on ? 'btn-ghost' : 'btn-primary'}>{on ? 'Seguindo' : textoSeguir}</button>
}
