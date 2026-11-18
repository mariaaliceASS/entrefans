import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from './api'
import type { Notificacoes } from '../types'

const EVENTO = 'entrefans:notificacoes'
const ZERO: Notificacoes = { solicitacoes_novas: 0, chamados_novos: 0 }
/** Avisa o cabeçalho para consultar de novo (ex.: depois de abrir "Conexões" ou aceitar uma solicitação). */
export const atualizarNotificacoes = () => window.dispatchEvent(new Event(EVENTO))

/**
 * Novidades para as bolinhas do menu: solicitações de conexão e pessoas que toparam seus rolês.
 * Atualiza ao abrir o app, ao trocar de página, ao voltar para a aba e a cada 60 s (sem WebSocket: suficiente para o MVP).
 */
export function useNotificacoes(ativo: boolean) {
  const [n, setN] = useState<Notificacoes>(ZERO); const { pathname } = useLocation()
  useEffect(() => {
    if (!ativo) { setN(ZERO); return }
    let vivo = true
    const carregar = () => api.get<Notificacoes>('/notificacoes').then(r => { if (vivo) setN({ ...ZERO, ...r }) }).catch(() => {})
    const aoVoltar = () => { if (document.visibilityState === 'visible') carregar() }
    carregar()
    const t = setInterval(carregar, 60_000)
    window.addEventListener(EVENTO, carregar); document.addEventListener('visibilitychange', aoVoltar)
    return () => { vivo = false; clearInterval(t); window.removeEventListener(EVENTO, carregar); document.removeEventListener('visibilitychange', aoVoltar) }
  }, [ativo, pathname])
  return n
}
