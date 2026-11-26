import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Janela estilo Y2K usada nas telas de login, cadastro e recuperação de senha. */
export default function JanelaAuth({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-8">
      {/* Imagem de fundo em movimento: só na área preta em volta da janela */}
      <div className="y2k-fundo-animado fixed" aria-hidden />
      <div className="y2k-janela w-full max-w-5xl">
        <div className="y2k-barra">
          <span className="flex items-center gap-2"><span aria-hidden>✦</span>entrefans.exe</span>
          <span className="flex gap-1" aria-hidden><span className="y2k-botao-janela">_</span><span className="y2k-botao-janela">□</span><span className="y2k-botao-janela">×</span></span>
        </div>
        <div className="flex">
          <aside className="y2k-grade relative hidden w-5/12 flex-col gap-6 border-r-2 border-[var(--y2k)] p-8 md:flex">
            <span aria-hidden className="absolute left-6 top-6 text-xl text-[var(--y2k)]">✦</span>
            <span aria-hidden className="absolute right-8 top-16 text-sm text-tertiary">✧</span>
            <span aria-hidden className="absolute bottom-40 right-6 text-lg text-secondary">✦</span>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
              <Link to="/fandoms"><img src="/logo.png" alt="EntreFans" width={941} height={457} className="h-auto w-full max-w-sm drop-shadow-[0_0_18px_rgba(177,76,255,0.45)]" /></Link>
              <div className="border-2 border-[var(--y2k)] bg-background px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--y2k)]">Comunidade Viva</div>
            </div>
            <div className="y2k-caixa">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase"><span className="h-2.5 w-2.5 animate-pulse bg-tertiary" />Fãs ativos por região</div>
              <p className="mt-2 text-xs text-on-surface-variant">Só mostramos a cidade e a distância aproximada. Nada de mapas invasivos ou endereço exato.</p>
            </div>
          </aside>
          <section className="w-full p-6 sm:p-8 md:w-7/12">
            <Link to="/fandoms"><img src="/logo.png" alt="EntreFans" width={941} height={457} className="mx-auto mb-4 h-auto w-48 md:hidden" /></Link>
            <h1 className="font-headline text-3xl font-bold">{titulo}</h1>
            {subtitulo && <p className="mt-1 text-sm text-on-surface-variant">{subtitulo}</p>}
            {children}
          </section>
        </div>
      </div>
      <nav className="relative mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        <Link to="/fandoms" className="hover:text-[var(--y2k)]">Fandoms</Link><Link to="/mural" className="hover:text-[var(--y2k)]">Mural de rolês</Link>
        <Link to="/termos" className="hover:text-[var(--y2k)]">Termos e privacidade</Link><Link to="/contato" className="hover:text-[var(--y2k)]">Fale conosco</Link>
      </nav>
    </div>
  )
}

/** Campo de formulário com rótulo e mensagem de erro logo abaixo. */
export function Campo({ id, label, erro, children }: { id: string; label: string; erro?: string; children: ReactNode }) {
  return (
    <div>
      <label className="y2k-label" htmlFor={id}>{label}</label>
      {children}
      {erro && <p id={`${id}-erro`} className="mt-1 text-xs text-error">{erro}</p>}
    </div>
  )
}

/** Campo de senha com botão para mostrar/esconder o que foi digitado. */
export function InputSenha({ className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visivel ? 'text' : 'password'} className={`y2k-input pr-20 ${className}`} />
      <button type="button" onClick={() => setVisivel(v => !v)} aria-pressed={visivel} aria-controls={props.id}
        aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
        className="absolute inset-y-0 right-0 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--y2k)] hover:underline">
        {visivel ? 'Ocultar' : 'Ver'}
      </button>
    </div>
  )
}

export const AlertaErro =({ msg }: { msg: string }) =>
  <p role="alert" className="border-2 border-error bg-error-container/30 px-3 py-2 text-sm text-on-error-container"><span className="font-mono font-bold">⚠ ERRO:</span> {msg}</p>
export const AlertaOk = ({ msg }: { msg: string }) =>
  <p role="status" className="border-2 border-tertiary bg-background px-3 py-2 text-sm text-tertiary"><span className="font-mono font-bold">✔</span> {msg}</p>
