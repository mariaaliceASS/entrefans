import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function setMeta(attr: 'name' | 'property', chave: string, valor: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${chave}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, chave); document.head.appendChild(el) }
  el.content = valor
}

/**
 * SEO/GEO por página (SPA): atualiza o <title>, a descrição, as tags Open Graph (og:) e do Twitter e o link canônico.
 * As tags fixas de autoria/direitos autorais (anti-plágio) e as OG padrão ficam no index.html.
 */
export default function Seo({ titulo, descricao, tipo = 'website' }: { titulo: string; descricao: string; tipo?: string }) {
  const { pathname } = useLocation()
  useEffect(() => {
    const t = `${titulo} | EntreFans`
    const url = window.location.origin + pathname
    document.title = t
    setMeta('name', 'description', descricao)
    setMeta('property', 'og:title', t)
    setMeta('property', 'og:description', descricao)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', tipo)
    setMeta('name', 'twitter:title', t)
    setMeta('name', 'twitter:description', descricao)
    let can = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!can) { can = document.createElement('link'); can.rel = 'canonical'; document.head.appendChild(can) }
    can.href = url
  }, [titulo, descricao, tipo, pathname])
  return null
}
