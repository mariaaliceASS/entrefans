import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import type { CidadeSugestao, Localizacao } from '../types'
import { Icon } from './Header'

const ORIGEM: Record<string, string> = {
  aparelho: 'pela localização do seu aparelho',
  cidade: 'pelo centro da cidade',
}

function erroGeo(e: GeolocationPositionError | Error): string {
  if ('code' in e) {
    if (e.code === e.PERMISSION_DENIED) return 'Você não permitiu o acesso à localização. Sem problemas: digite sua cidade abaixo.'
    if (e.code === e.TIMEOUT) return 'Demorou demais para obter a localização. Tente de novo ou digite sua cidade.'
    return 'Não foi possível obter sua localização. Digite sua cidade abaixo.'
  }
  return e.message
}

/**
 * Define a localização APROXIMADA do usuário: pelo aparelho (pede permissão) ou digitando a cidade.
 * O backend arredonda para uma área de ~1 km; outras pessoas veem só a cidade e a faixa de distância.
 */
export default function LocalizacaoPicker({ valor, onSalvo }: { valor: Localizacao | null; onSalvo: (l: Localizacao) => void }) {
  const [ocupado, setOcupado] = useState(false); const [erro, setErro] = useState('')
  const [q, setQ] = useState(''); const [sugestoes, setSugestoes] = useState<CidadeSugestao[]>([]); const [buscando, setBuscando] = useState(false)
  const req = useRef(0)
  const geoDisponivel = typeof navigator !== 'undefined' && 'geolocation' in navigator && window.isSecureContext

  const salvar = async (dados: { lat?: number; lng?: number; origem: 'aparelho' | 'cidade' }) => {
    setOcupado(true); setErro('')
    try {
      const p = await api.post<Localizacao>('/perfis/me/localizacao', dados)
      onSalvo({ cidade: p.cidade, uf: p.uf, localizacao_origem: p.localizacao_origem, tem_localizacao: p.tem_localizacao })
      setQ(''); setSugestoes([])
    } catch (e) { setErro((e as Error).message) } finally { setOcupado(false) }
  }

  const usarAparelho = () => {
    setErro(''); setOcupado(true)
    // Precisão baixa basta (e economiza bateria): o servidor arredonda para ~1 km de qualquer forma
    navigator.geolocation.getCurrentPosition(
      pos => salvar({ lat: pos.coords.latitude, lng: pos.coords.longitude, origem: 'aparelho' }),
      e => { setOcupado(false); setErro(erroGeo(e)) },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    )
  }

  useEffect(() => {
    setSugestoes([])
    if (q.trim().length < 3) { setBuscando(false); return }
    const id = ++req.current; setBuscando(true)
    const t = setTimeout(() => {
      api.get<CidadeSugestao[]>(`/localizacao/cidades?q=${encodeURIComponent(q.trim())}`)
        .then(r => { if (id === req.current) setSugestoes(r) })
        .catch(e => { if (id === req.current) setErro(e.message) })
        .finally(() => { if (id === req.current) setBuscando(false) })
    }, 500)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="space-y-3">
      {valor?.tem_localizacao && (
        <div className="flex items-start gap-2 border-2 border-tertiary bg-background p-3 text-sm">
          <span className="text-tertiary"><Icon n="location_on" fill /></span>
          <div><div className="font-semibold">{valor.cidade}{valor.uf ? `, ${valor.uf}` : ''}</div>
            <div className="text-xs text-on-surface-variant">Área aproximada definida {ORIGEM[valor.localizacao_origem ?? ''] ?? ''}.</div></div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {geoDisponivel && <button type="button" disabled={ocupado} onClick={usarAparelho} className="btn-primary">
          <Icon n="my_location" />{ocupado ? 'Localizando…' : valor?.tem_localizacao ? 'Atualizar pela localização do aparelho' : 'Usar minha localização'}</button>}
        {valor?.tem_localizacao && valor.localizacao_origem !== 'cidade' && (
          <button type="button" disabled={ocupado} onClick={() => salvar({ origem: 'cidade' })} className="btn-ghost" title="Mais privacidade: as distâncias passam a ser calculadas a partir do centro da cidade">
            Usar só o centro da cidade</button>)}
      </div>
      <div>
        <label className="label" htmlFor="loc-cidade">{geoDisponivel ? 'Ou digite sua cidade' : 'Digite sua cidade'}</label>
        <input id="loc-cidade" className="input" placeholder="Ex.: Canoas" value={q} onChange={e => setQ(e.target.value)} autoComplete="off" />
        {buscando && <p className="mt-1 text-xs text-on-surface-variant">Buscando cidades…</p>}
        {sugestoes.length > 0 && (
          <ul className="mt-2 divide-y-2 divide-[var(--y2k-escuro)] border-2 border-[var(--y2k)] bg-background">
            {sugestoes.map(s => (
              <li key={`${s.nome}-${s.uf}`}><button type="button" disabled={ocupado} onClick={() => salvar({ lat: s.lat, lng: s.lng, origem: 'cidade' })}
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface-container-highest">{s.nome} <span className="text-on-surface-variant">— {s.uf}</span></button></li>
            ))}
          </ul>
        )}
        {!buscando && q.trim().length >= 3 && sugestoes.length === 0 && !erro && <p className="mt-1 text-xs text-on-surface-variant">Nenhuma cidade brasileira encontrada com esse nome.</p>}
      </div>
      {erro && <p className="text-sm text-error">{erro}</p>}
      <p className="flex items-start gap-2 text-xs text-on-surface-variant"><span className="text-tertiary"><Icon n="shield" /></span>
        Guardamos só uma área aproximada (cerca de 1 km), nunca o ponto exato. Outros fãs veem apenas sua cidade e a distância em faixas, como “a menos de 2 km”.
        Sua localização não é monitorada: ela só muda quando você atualizar aqui.</p>
    </div>
  )
}
