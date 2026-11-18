import { Icon } from './Header'
interface Props { nome: string; ativo?: boolean; onClick?: () => void; destaque?: boolean; badge?: number; icone?: string; title?: string; aberto?: boolean; suave?: boolean }
/** Chip quadrado (visual Y2K). ativo = escolhido · destaque = em comum com você · suave = item dentro de um tema */
export default function InterestTag({ nome, ativo, onClick, destaque, badge, icone, title, aberto, suave }: Props) {
  const cls = ativo ? 'border-[var(--y2k)] bg-[var(--y2k)] text-[var(--y2k-fundo)]'
    : destaque ? 'border-tertiary bg-background text-tertiary'
    : suave ? 'border-outline-variant bg-background text-on-surface-variant'
    : 'border-[var(--y2k-escuro)] bg-background text-on-surface'
  const ic = icone ?? (ativo || destaque ? 'check' : undefined)
  return (
    <button type="button" disabled={!onClick} onClick={onClick} title={title} aria-pressed={onClick ? !!ativo : undefined} aria-expanded={aberto}
      className={`inline-flex items-center gap-1 border-2 px-2.5 py-1 text-xs font-semibold ${cls} ${aberto ? 'shadow-[3px_3px_0_theme(colors.tertiary)]' : ''} ${onClick ? 'transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[2px_2px_0_var(--y2k-escuro)]' : 'cursor-default'}`}>
      {ic && <span className="text-sm"><Icon n={ic} /></span>}{nome}
      {!!badge && <span className={`ml-0.5 border px-1 font-mono text-[10px] font-bold ${ativo ? 'border-[var(--y2k-fundo)]' : 'border-[var(--y2k)] text-[var(--y2k)]'}`}>{badge}</span>}
    </button>
  )
}
