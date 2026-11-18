import { Link } from 'react-router-dom'

/** Rodapé usado em todas as telas (públicas e logadas). */
export default function Footer() {
  const ano = new Date().getFullYear()
  const link = 'hover:text-[var(--y2k)] hover:underline'
  return (
    <footer className="mt-10 border-t-2 border-[var(--y2k)] bg-[var(--y2k-fundo)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-x-4 gap-y-1 font-mono font-bold uppercase tracking-wider" aria-label="Rodapé">
          <Link className={link} to="/fandoms">Fandoms</Link>
          <Link className={link} to="/mural">Mural de rolês</Link>
          <Link className={link} to="/termos">Termos de uso</Link>
          <Link className={link} to="/termos#privacidade">Privacidade (LGPD)</Link>
          <Link className={link} to="/termos#plagio">Política de plágio</Link>
          <Link className={link} to="/contato">Fale conosco</Link>
        </nav>
        <p>© {ano} EntreFans · {import.meta.env.VITE_AUTOR}. Conteúdo original; reprodução proibida sem autorização.</p>
      </div>
    </footer>
  )
}
