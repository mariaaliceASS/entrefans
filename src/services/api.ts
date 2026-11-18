/** Todas as chamadas AJAX ao backend PHP passam por aqui (fetch + JSON, com o cookie de sessão). */
async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData
  const res = await fetch('/api' + url, {
    method, credentials: 'include',
    headers: { 'X-Requested-With': 'XMLHttpRequest', ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { erro?: string }).erro || 'Erro inesperado.')
  return data as T
}
export const api = {
  get: <T,>(u: string) => req<T>('GET', u),
  post: <T,>(u: string, b?: unknown) => req<T>('POST', u, b ?? {}),
  put: <T,>(u: string, b: unknown) => req<T>('PUT', u, b),
  del: <T,>(u: string) => req<T>('DELETE', u),
}
