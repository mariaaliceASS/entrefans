/** Data local no formato AAAA-MM-DD (para inputs type="date"). */
export const diaLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** "Hoje", "Amanhã" ou "sáb, 06/12" para a data de um rolê. */
export function quandoTexto(q: string | null) {
  if (!q) return 'Sem data'
  const [y, m, d] = q.split('-').map(Number); const dia = new Date(y, m - 1, d)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const dif = Math.round((dia.getTime() - hoje.getTime()) / 86_400_000)
  if (dif === 0) return 'Hoje'
  if (dif === 1) return 'Amanhã'
  return dia.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '')
}

export const cidadeUf = (cidade: string | null, uf: string | null) => (cidade ? `${cidade}${uf ? ' - ' + uf : ''}` : null)
